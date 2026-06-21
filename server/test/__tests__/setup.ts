/**
 * Jest 测试环境 Setup
 * - Mock Prisma Client
 * - 全局测试工具
 */

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockPrisma: Record<string, any> = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
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
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productSku: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    merchant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  // 添加 $transaction 方法
  mockPrisma.$transaction = jest.fn(
    (callback: (prisma: typeof mockPrisma) => any) => callback(mockPrisma),
  );

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    OrderType: {
      PRODUCT: "PRODUCT",
      TABLE_BOOKING: "TABLE_BOOKING",
      ACCOMMODATION: "ACCOMMODATION",
      TICKET: "TICKET",
      ROUTE: "ROUTE",
    },
    OrderStatus: {
      PENDING_PAYMENT: "PENDING_PAYMENT",
      PAID: "PAID",
      CONFIRMED: "CONFIRMED",
      IN_PROGRESS: "IN_PROGRESS",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED",
      REFUNDING: "REFUNDING",
      REFUNDED: "REFUNDED",
    },
    MerchantModule: {
      CLOTHING: "CLOTHING",
      DINING: "DINING",
      ACCOMMODATION: "ACCOMMODATION",
      TRAVEL: "TRAVEL",
    },
  };
});

// 全局测试超时
jest.setTimeout(10000);

// 清理所有 mock
afterEach(() => {
  jest.clearAllMocks();
});
