import { OrderService } from "../../src/service/order.service";

// 创建 mock Prisma 对象
const createMockPrisma = (): Record<string, any> => ({
  order: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((callback: (prisma: any) => any) =>
    callback(createMockPrisma()),
  ),
});

describe("OrderService", () => {
  let orderService: OrderService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    orderService = new OrderService();
    mockPrisma = createMockPrisma();
    (orderService as any).prisma = mockPrisma;
  });

  describe("createOrder", () => {
    it("should create order with correct total amount using integer cents", async () => {
      const mockOrder = {
        id: 1,
        orderNo: "WD1234567890ABCDEF",
        userId: 1,
        orderType: "PRODUCT",
        module: "CLOTHING",
        status: "PENDING_PAYMENT",
        totalAmount: 0.3,
        items: [
          {
            id: 1,
            productId: 1,
            productName: "银饰手镯",
            price: 0.1,
            quantity: 3,
            subtotal: 0.3,
          },
        ],
      };
      mockPrisma.order.create = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.createOrder({
        userId: 1,
        orderType: "PRODUCT" as any,
        module: "CLOTHING" as any,
        items: [
          {
            productId: 1,
            productName: "银饰手镯",
            price: 0.1,
            quantity: 3,
          },
        ],
      });

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.create).toHaveBeenCalled();

      // 验证调用参数中的金额计算
      const callArgs = (mockPrisma.order.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.totalAmount).toBe(0.3);
      expect(callArgs.data.items.create[0].subtotal).toBe(0.3);
    });

    it("should handle large quantities correctly", async () => {
      mockPrisma.order.create = jest.fn().mockResolvedValue({
        id: 1,
        totalAmount: 99999.99,
        items: [],
      });

      await orderService.createOrder({
        userId: 1,
        orderType: "PRODUCT" as any,
        module: "CLOTHING" as any,
        items: [
          {
            productId: 1,
            productName: "苗族银饰套装",
            price: 33333.33,
            quantity: 3,
          },
        ],
      });

      const callArgs = (mockPrisma.order.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.totalAmount).toBe(99999.99);
    });
  });

  describe("paySuccess", () => {
    it("should update order to PAID when order is PENDING_PAYMENT", async () => {
      const mockOrder = {
        id: 1,
        status: "PENDING_PAYMENT",
      };
      mockPrisma.order.findUnique = jest.fn().mockResolvedValue(mockOrder);
      mockPrisma.order.update = jest.fn().mockResolvedValue({
        ...mockOrder,
        status: "PAID",
      });

      await orderService.paySuccess(1, "TRADE_123", 99.99);

      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.order.update).toHaveBeenCalled();
    });

    it("should return existing order if already PAID (duplicate callback)", async () => {
      const mockOrder = {
        id: 1,
        status: "PAID",
      };
      mockPrisma.order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.paySuccess(1, "TRADE_123", 99.99);

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it("should return existing order if CANCELLED", async () => {
      const mockOrder = {
        id: 1,
        status: "CANCELLED",
      };
      mockPrisma.order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.paySuccess(1, "TRADE_123", 99.99);

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it("should throw error if order not found", async () => {
      mockPrisma.order.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        orderService.paySuccess(999, "TRADE_123", 99.99),
      ).rejects.toThrow("订单不存在");
    });
  });

  describe("cancelOrder", () => {
    it("should update order status to CANCELLED", async () => {
      mockPrisma.order.update = jest.fn().mockResolvedValue({
        id: 1,
        status: "CANCELLED",
        cancelReason: "用户主动取消",
        cancelTime: new Date(),
      });

      await orderService.cancelOrder(1, "用户主动取消");

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: "CANCELLED",
          cancelReason: "用户主动取消",
        }),
      });
    });
  });

  describe("findByUser", () => {
    it("should return paginated orders", async () => {
      const mockOrders = [
        { id: 1, userId: 1, status: "PENDING_PAYMENT" },
        { id: 2, userId: 1, status: "COMPLETED" },
      ];
      mockPrisma.order.findMany = jest.fn().mockResolvedValue(mockOrders);
      mockPrisma.order.count = jest.fn().mockResolvedValue(2);

      const result = await orderService.findByUser(1, {
        page: 1,
        pageSize: 20,
      });

      expect(result.list).toEqual(mockOrders);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("should filter by status when provided", async () => {
      mockPrisma.order.findMany = jest.fn().mockResolvedValue([]);
      mockPrisma.order.count = jest.fn().mockResolvedValue(0);

      await orderService.findByUser(1, {
        status: "PENDING_PAYMENT",
        page: 1,
        pageSize: 20,
      });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 1,
            status: "PENDING_PAYMENT",
          }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return order with items and payment", async () => {
      const mockOrder = {
        id: 1,
        userId: 1,
        items: [{ id: 1, productName: "银饰" }],
        payment: { id: 1, status: "SUCCESS" },
        refund: null,
      };
      mockPrisma.order.findUnique = jest.fn().mockResolvedValue(mockOrder);

      const result = await orderService.findById(1);

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: true, payment: true, refund: true },
      });
    });

    it("should return null for non-existent order", async () => {
      mockPrisma.order.findUnique = jest.fn().mockResolvedValue(null);

      const result = await orderService.findById(999);

      expect(result).toBeNull();
    });
  });
});
