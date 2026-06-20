import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class TravelService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 景区列表 */
  async findScenicSpots(params: {
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
      this.prisma.scenicSpot.findMany({
        where,
        include: { ticketTypes: { where: { status: true }, take: 2 } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.scenicSpot.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 景区详情 */
  async findScenicSpotById(id: number) {
    return this.prisma.scenicSpot.findUnique({
      where: { id },
      include: { ticketTypes: { where: { status: true } } },
    });
  }

  /** 路线套餐列表 */
  async findRoutes(params: {
    keyword?: string;
    theme?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      keyword,
      theme,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = { status: "ACTIVE" };
    if (keyword) where.title = { contains: keyword };
    if (theme) where.themeTags = { contains: theme };

    const [list, total] = await Promise.all([
      this.prisma.travelRoute.findMany({
        where,
        include: { itineraries: { orderBy: { day: "asc" } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.travelRoute.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 路线详情 */
  async findRouteById(id: number) {
    return this.prisma.travelRoute.findUnique({
      where: { id },
      include: { itineraries: { orderBy: { day: "asc" } } },
    });
  }

  /** 交通攻略 */
  async findTransportGuides() {
    return this.prisma.transportGuide.findMany({
      where: { status: true },
      orderBy: { sort: "asc" },
    });
  }

  /** 电子票查询 */
  async findETicketByCode(ticketCode: string) {
    return this.prisma.eTicket.findUnique({
      where: { ticketCode },
    });
  }

  /** 创建门票订单（事务保证原子性，库存原子扣减防超卖） */
  async createTicketOrder(data: {
    userId: number;
    ticketTypeId: number;
    quantity: number;
    validDate: string;
    contactName: string;
    contactPhone: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 原子扣减库存：只有库存足够时才扣减
      const result = await tx.ticketType.updateMany({
        where: {
          id: data.ticketTypeId,
          status: true,
          stock: { gte: data.quantity },
        },
        data: { stock: { decrement: data.quantity } },
      });
      if (result.count === 0) {
        throw new Error("票种不存在、已停售或库存不足");
      }

      const ticketType = await tx.ticketType.findUnique({
        where: { id: data.ticketTypeId },
        include: { spot: true },
      });
      if (!ticketType) throw new Error("票种不存在");

      const totalAmount = Number(ticketType.price) * data.quantity;

      const order = await tx.order.create({
        data: {
          orderNo: `WD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          userId: data.userId,
          orderType: "TICKET",
          module: "TRAVEL",
          totalAmount,
          items: {
            create: [
              {
                productName: `${ticketType.spot.name} - ${ticketType.name}`,
                price: ticketType.price,
                quantity: data.quantity,
                subtotal: totalAmount,
              },
            ],
          },
        },
      });

      // 生成电子票
      for (let i = 0; i < data.quantity; i++) {
        const ticketCode = `TK${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}${i}`;
        await tx.eTicket.create({
          data: {
            orderId: order.id,
            ticketCode,
            targetId: data.ticketTypeId,
            targetType: "ticket",
            validDate: new Date(data.validDate),
            status: "UNUSED",
          },
        });
      }

      return order;
    });
  }
}
