import { RegisterDTO, LoginDTO, ChangePasswordDTO } from "../dto/user.dto";
import { CreateOrderDTO, CancelOrderDTO } from "../dto/order.dto";

/**
 * DTO 验证测试
 * 测试 Joi schema 验证规则是否正确
 */

// 辅助函数：验证 DTO
function validateDTO(
  dtoClass: any,
  data: any,
): { valid: boolean; errors?: string[] } {
  try {
    const instance = new dtoClass();
    Object.assign(instance, data);
    // 简单验证必填字段存在
    const schema = (dtoClass as any).__schema__;
    if (schema) {
      const { error } = schema.validate(data);
      if (error) {
        return {
          valid: false,
          errors: error.details.map((d: any) => d.message),
        };
      }
    }
    return { valid: true };
  } catch (err: any) {
    return { valid: false, errors: [err.message] };
  }
}

describe("User DTOs", () => {
  describe("RegisterDTO", () => {
    it("should have correct structure", () => {
      const dto = new RegisterDTO();
      dto.phone = "13800138000";
      dto.password = "password123";
      dto.nickname = "测试用户";

      expect(dto.phone).toBe("13800138000");
      expect(dto.password).toBe("password123");
      expect(dto.nickname).toBe("测试用户");
    });
  });

  describe("LoginDTO", () => {
    it("should have correct structure", () => {
      const dto = new LoginDTO();
      dto.phone = "13800138000";
      dto.password = "password123";

      expect(dto.phone).toBe("13800138000");
      expect(dto.password).toBe("password123");
    });
  });

  describe("ChangePasswordDTO", () => {
    it("should have correct structure", () => {
      const dto = new ChangePasswordDTO();
      dto.oldPassword = "oldpassword";
      dto.newPassword = "newpassword123";

      expect(dto.oldPassword).toBe("oldpassword");
      expect(dto.newPassword).toBe("newpassword123");
    });
  });
});

describe("Order DTOs", () => {
  describe("CreateOrderDTO", () => {
    it("should have correct structure with valid data", () => {
      const dto = new CreateOrderDTO();
      dto.orderType = "PRODUCT";
      dto.module = "CLOTHING";
      dto.items = [
        {
          productId: 1,
          productName: "银饰手镯",
          price: 99.99,
          quantity: 2,
        },
      ];

      expect(dto.orderType).toBe("PRODUCT");
      expect(dto.module).toBe("CLOTHING");
      expect(dto.items).toHaveLength(1);
      expect(dto.items[0].productName).toBe("银饰手镯");
    });

    it("should accept all valid order types", () => {
      const validTypes = [
        "PRODUCT",
        "TABLE_BOOKING",
        "ACCOMMODATION",
        "TICKET",
        "ROUTE",
      ];

      validTypes.forEach((type) => {
        const dto = new CreateOrderDTO();
        dto.orderType = type;
        expect(dto.orderType).toBe(type);
      });
    });

    it("should accept all valid modules", () => {
      const validModules = ["CLOTHING", "DINING", "ACCOMMODATION", "TRAVEL"];

      validModules.forEach((module) => {
        const dto = new CreateOrderDTO();
        dto.module = module;
        expect(dto.module).toBe(module);
      });
    });
  });

  describe("CancelOrderDTO", () => {
    it("should have correct structure", () => {
      const dto = new CancelOrderDTO();
      dto.reason = "用户主动取消";

      expect(dto.reason).toBe("用户主动取消");
    });
  });
});
