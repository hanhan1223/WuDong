import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, BookingStatus } from "@prisma/client";
import { PAGINATION } from "../common/constants";

@Provide()
export class RestaurantService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 餐厅列表 */
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
      this.prisma.restaurant.findMany({
        where,
        include: {
          dishes: {
            where: { status: true },
            take: 3,
            orderBy: { isSignature: "desc" },
          },
        },
        orderBy: { rating: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 餐厅详情 */
  async findById(id: number) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        dishes: { where: { status: true }, orderBy: { isSignature: "desc" } },
        timeSlots: { where: { status: true } },
      },
    });
  }

  /** 菜品列表 */
  async findDishes(restaurantId: number) {
    return this.prisma.restaurantDish.findMany({
      where: { restaurantId, status: true },
      orderBy: { isSignature: "desc" },
    });
  }

  /** 可预订时段 */
  async findTimeSlots(restaurantId: number) {
    return this.prisma.timeSlot.findMany({
      where: { restaurantId, status: true },
    });
  }

  /** 预订餐位 */
  async createBooking(data: {
    restaurantId: number;
    userId: number;
    bookingDate: Date;
    timeSlotId: number;
    guestCount: number;
    contactName: string;
    contactPhone: string;
    remark?: string;
  }) {
    // 检查时段是否存在
    const slot = await this.prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
    });
    if (!slot || !slot.status) throw new Error("该时段不可预订");

    // 检查该时段当日预订数
    const dateStr = data.bookingDate.toISOString().split("T")[0];
    const existingCount = await this.prisma.tableBooking.count({
      where: {
        restaurantId: data.restaurantId,
        timeSlotId: data.timeSlotId,
        bookingDate: data.bookingDate,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingCount >= slot.maxBooking) {
      throw new Error("该时段已满，请选择其他时段");
    }

    return this.prisma.tableBooking.create({
      data: {
        restaurantId: data.restaurantId,
        userId: data.userId,
        bookingDate: data.bookingDate,
        timeSlotId: data.timeSlotId,
        guestCount: data.guestCount,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        remark: data.remark,
        status: "PENDING",
      },
    });
  }

  /** 我的预订列表 */
  async findBookingsByUser(userId: number, page: number, pageSize: number) {
    const [list, total] = await Promise.all([
      this.prisma.tableBooking.findMany({
        where: { userId },
        include: {
          restaurant: {
            select: { id: true, name: true, mainImage: true, address: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.tableBooking.count({ where: { userId } }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 取消预订 */
  async cancelBooking(bookingId: number, userId: number) {
    const booking = await this.prisma.tableBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new Error("预订不存在");
    if (booking.userId !== userId) throw new Error("无权取消该预订");
    if (booking.status === "CANCELLED") throw new Error("预订已取消");
    if (booking.status === "COMPLETED") throw new Error("预订已完成，无法取消");

    return this.prisma.tableBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  }

  /** 农产品分类 */
  async findFarmCategories() {
    return this.prisma.farmCategory.findMany({
      where: { status: true },
      orderBy: { sort: "asc" },
    });
  }

  /** 农产品列表 */
  async findFarmProducts(params: {
    categoryId?: number;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      categoryId,
      keyword,
      page = PAGINATION.DEFAULT_PAGE,
      pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    } = params;
    const where: any = { status: "ACTIVE" };
    if (categoryId) where.categoryId = categoryId;
    if (keyword) where.name = { contains: keyword };

    const [list, total] = await Promise.all([
      this.prisma.farmProduct.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.farmProduct.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 农产品详情 */
  async findFarmProductById(id: number) {
    return this.prisma.farmProduct.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
  }
}
