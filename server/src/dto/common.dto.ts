import { Rule, RuleType } from "@midwayjs/validate";

/** 创建评价 DTO */
export class CreateReviewDTO {
  @Rule(
    RuleType.string()
      .valid("PRODUCT", "RESTAURANT", "HOMESTAY", "ROUTE")
      .required(),
  )
  targetType!: string;

  @Rule(RuleType.number().integer().positive().required())
  targetId!: number;

  @Rule(RuleType.number().integer().positive().optional())
  orderId?: number;

  @Rule(RuleType.number().integer().min(1).max(5).required())
  rating!: number;

  @Rule(RuleType.string().max(1000).optional())
  content?: string;

  @Rule(RuleType.array().items(RuleType.string()).max(9).optional())
  images?: string[];
}

/** 追评 DTO */
export class AppendReviewDTO {
  @Rule(RuleType.string().min(1).max(1000).required())
  content!: string;
}

/** 商家回复评价 DTO */
export class ReplyReviewDTO {
  @Rule(RuleType.string().min(1).max(500).required())
  content!: string;
}

/** 创建收货地址 DTO */
export class CreateAddressDTO {
  @Rule(RuleType.string().min(1).max(50).required())
  name!: string;

  @Rule(
    RuleType.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required(),
  )
  phone!: string;

  @Rule(RuleType.string().min(1).max(50).required())
  province!: string;

  @Rule(RuleType.string().min(1).max(50).required())
  city!: string;

  @Rule(RuleType.string().min(1).max(50).required())
  district!: string;

  @Rule(RuleType.string().min(1).max(200).required())
  detail!: string;

  @Rule(RuleType.boolean().optional())
  isDefault?: boolean;
}

/** 更新收货地址 DTO */
export class UpdateAddressDTO {
  @Rule(RuleType.string().min(1).max(50).optional())
  name?: string;

  @Rule(
    RuleType.string()
      .pattern(/^1[3-9]\d{9}$/)
      .optional(),
  )
  phone?: string;

  @Rule(RuleType.string().min(1).max(50).optional())
  province?: string;

  @Rule(RuleType.string().min(1).max(50).optional())
  city?: string;

  @Rule(RuleType.string().min(1).max(50).optional())
  district?: string;

  @Rule(RuleType.string().min(1).max(200).optional())
  detail?: string;

  @Rule(RuleType.boolean().optional())
  isDefault?: boolean;
}

/** 切换收藏 DTO */
export class ToggleFavoriteDTO {
  @Rule(
    RuleType.string()
      .valid("PRODUCT", "RESTAURANT", "HOMESTAY", "ROUTE", "POST")
      .required(),
  )
  targetType!: string;

  @Rule(RuleType.number().integer().positive().required())
  targetId!: number;
}
