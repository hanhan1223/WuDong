import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class HomestayService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 民宿列表 */
  async findMany(params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      keyword,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = { status: "ACTIVE" };
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { address: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.homestay.findMany({
        where,
        include: {
          roomTypes: {
            where: { status: true },
            take: 2,
            select: { id: true, name: true, price: true },
          },
        },
        orderBy: { rating: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.homestay.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 民宿详情 */
  async findById(id: number) {
    return this.prisma.homestay.findUnique({
      where: { id },
      include: {
        roomTypes: { where: { status: true } },
        checkinRules: true,
      },
    });
  }

  /** 房型列表 */
  async findRoomTypes(homestayId: number) {
    return this.prisma.roomType.findMany({
      where: { homestayId, status: true },
    });
  }

  /** 房态日历 */
  async findRoomCalendar(
    roomTypeId: number,
    startDate: string,
    endDate: string,
  ) {
    return this.prisma.roomCalendar.findMany({
      where: {
        roomTypeId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: "asc" },
    });
  }

  /** 预订房间（事务保证原子性，库存原子扣减防超卖） */
  async createBooking(data: {
    roomTypeId: number;
    userId: number;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    contactName: string;
    contactPhone: string;
    remark?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const roomType = await tx.roomType.findUnique({
        where: { id: data.roomTypeId },
        include: { homestay: true },
      });
      if (!roomType || !roomType.status) throw new Error("房型不存在或已下架");

      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        throw new Error("入住/退房日期无效");
      }

      const nights = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 原子扣减库存：只有 available > 0 的行才会被更新
      const calendars = await tx.roomCalendar.findMany({
        where: { roomTypeId: data.roomTypeId, date: { gte: start, lt: end } },
      });

      for (const cal of calendars) {
        const result = await tx.roomCalendar.updateMany({
          where: { id: cal.id, available: { gt: 0 } },
          data: { available: { decrement: 1 } },
        });
        if (result.count === 0) {
          throw new Error(
            `${cal.date.toISOString().split("T")[0]} 房间已满，请选择其他日期`,
          );
        }
      }

      const totalPrice = nights * Number(roomType.price);

      const order = await tx.order.create({
        data: {
          orderNo: `WD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          userId: data.userId,
          orderType: "ACCOMMODATION",
          module: "ACCOMMODATION",
          totalAmount: totalPrice,
          remark: [
            data.remark,
            `入住人数: ${data.guestCount}, 联系人: ${data.contactName}, 电话: ${data.contactPhone}`,
          ]
            .filter(Boolean)
            .join("; "),
          items: {
            create: [
              {
                productName: `${roomType.homestay.name} - ${roomType.name}`,
                productImage: roomType.mainImage || roomType.homestay.mainImage,
                price: roomType.price,
                quantity: nights,
                subtotal: totalPrice,
              },
            ],
          },
        },
      });

      return order;
    });
  }
}
