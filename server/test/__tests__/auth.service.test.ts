import { AuthService } from "../service/auth.service";
import { UserService } from "../service/user.service";
import { JwtService } from "@midwayjs/jwt";

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    authService = new AuthService();
    mockUserService = {
      loginByPassword: jest.fn(),
      register: jest.fn(),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      getTokenPayload: jest.fn(),
    } as any;
    mockJwtService = {
      sign: jest.fn().mockResolvedValue("mock_jwt_token"),
      verify: jest.fn(),
    } as any;

    (authService as any).userService = mockUserService;
    (authService as any).jwtService = mockJwtService;
  });

  describe("loginByPassword", () => {
    it("should return token and user on successful login", async () => {
      const mockUser = {
        id: 1,
        phone: "13800138000",
        nickname: "测试用户",
        avatar: null,
        role: "TOURIST",
        status: "ACTIVE",
        password: "hashed",
      };
      mockUserService.loginByPassword = jest.fn().mockResolvedValue(mockUser);
      mockUserService.getTokenPayload = jest.fn().mockReturnValue({
        userId: 1,
        role: "TOURIST",
        phone: "13800138000",
      });

      const result = await authService.loginByPassword(
        "13800138000",
        "password123",
      );

      expect(result).toHaveProperty("token", "mock_jwt_token");
      expect(result).toHaveProperty("user");
      expect(result.user.id).toBe(1);
      expect(result.user.phone).toBe("13800138000");
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it("should throw error for disabled user", async () => {
      const mockUser = {
        id: 1,
        phone: "13800138000",
        status: "DISABLED",
      };
      mockUserService.loginByPassword = jest.fn().mockResolvedValue(mockUser);

      await expect(
        authService.loginByPassword("13800138000", "password123"),
      ).rejects.toThrow("账号已被禁用");
    });

    it("should propagate error from userService.loginByPassword", async () => {
      mockUserService.loginByPassword = jest
        .fn()
        .mockRejectedValue(new Error("用户不存在"));

      await expect(
        authService.loginByPassword("13900000000", "password123"),
      ).rejects.toThrow("用户不存在");
    });
  });

  describe("register", () => {
    it("should register and return token", async () => {
      const mockUser = {
        id: 1,
        phone: "13800138000",
        nickname: "新用户",
        role: "TOURIST",
      };
      mockUserService.register = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.register({
        phone: "13800138000",
        password: "password123",
        nickname: "新用户",
      });

      expect(result).toHaveProperty("token", "mock_jwt_token");
      expect(result).toHaveProperty("user");
      expect(result.user.id).toBe(1);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          role: "TOURIST",
          phone: "13800138000",
        }),
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify and return payload", async () => {
      const mockPayload = {
        userId: 1,
        role: "TOURIST",
        phone: "13800138000",
      };
      mockJwtService.verify = jest.fn().mockResolvedValue(mockPayload);

      const result = await authService.verifyToken("valid_token");

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith("valid_token");
    });

    it("should throw error for invalid token", async () => {
      mockJwtService.verify = jest
        .fn()
        .mockRejectedValue(new Error("Invalid token"));

      await expect(authService.verifyToken("invalid_token")).rejects.toThrow(
        "Invalid token",
      );
    });
  });
});
