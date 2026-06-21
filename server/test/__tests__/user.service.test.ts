import { UserService } from "../service/user.service";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn(),
}));

describe("UserService", () => {
  let userService: UserService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    userService = new UserService();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    // 注入 mock prisma
    (userService as any).prisma = mockPrisma;
  });

  describe("findByPhone", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: 1,
        phone: "13800138000",
        nickname: "测试用户",
        password: "hashed_password",
        role: "TOURIST",
        status: "ACTIVE",
      };
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.findByPhone("13800138000");

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { phone: "13800138000" },
      });
    });

    it("should return null when user not found", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await userService.findByPhone("13900000000");

      expect(result).toBeNull();
    });
  });

  describe("register", () => {
    it("should create a new user successfully", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        id: 1,
        phone: "13800138000",
        nickname: "新用户",
        role: "TOURIST",
      });

      const result = await userService.register({
        phone: "13800138000",
        password: "password123",
        nickname: "新用户",
      });

      expect(result).toHaveProperty("id");
      expect(result.phone).toBe("13800138000");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should throw error if phone already registered", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        phone: "13800138000",
      });

      await expect(
        userService.register({
          phone: "13800138000",
          password: "password123",
          nickname: "新用户",
        }),
      ).rejects.toThrow("该手机号已注册");
    });
  });

  describe("loginByPassword", () => {
    it("should return user on valid credentials", async () => {
      const mockUser = {
        id: 1,
        phone: "13800138000",
        password: "hashed_password",
        nickname: "测试用户",
        role: "TOURIST",
        status: "ACTIVE",
      };
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.loginByPassword(
        "13800138000",
        "password123",
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        userService.loginByPassword("13900000000", "password123"),
      ).rejects.toThrow("用户不存在");
    });

    it("should throw error on wrong password", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        phone: "13800138000",
        password: "hashed_password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.loginByPassword("13800138000", "wrongpassword"),
      ).rejects.toThrow("密码错误");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const updatedUser = {
        id: 1,
        phone: "13800138000",
        nickname: "新昵称",
        avatar: "https://example.com/avatar.jpg",
        gender: 1,
        region: "贵州",
        bio: "热爱旅行",
        role: "TOURIST",
      };
      mockPrisma.user.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(1, {
        nickname: "新昵称",
        avatar: "https://example.com/avatar.jpg",
        gender: 1,
      });

      expect(result).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          nickname: "新昵称",
          avatar: "https://example.com/avatar.jpg",
          gender: 1,
        },
        select: expect.any(Object),
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        password: "old_hashed_password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.update = jest.fn().mockResolvedValue({});

      await userService.changePassword(1, "oldpassword", "newpassword");

      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("should throw error on wrong old password", async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        password: "old_hashed_password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.changePassword(1, "wrongold", "newpassword"),
      ).rejects.toThrow("原密码错误");
    });
  });
});
