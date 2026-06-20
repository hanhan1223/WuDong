import { Rule, RuleType } from "@midwayjs/validate";

/** 注册 DTO */
export class RegisterDTO {
  @Rule(
    RuleType.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required(),
  )
  phone!: string;

  @Rule(RuleType.string().min(8).max(20).required())
  password!: string;

  @Rule(RuleType.string().min(1).max(50).required())
  nickname!: string;
}

/** 登录 DTO */
export class LoginDTO {
  @Rule(
    RuleType.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required(),
  )
  phone!: string;

  @Rule(RuleType.string().min(1).required())
  password!: string;
}

/** 更新资料 DTO */
export class UpdateProfileDTO {
  @Rule(RuleType.string().min(1).max(50).optional())
  nickname?: string;

  @Rule(RuleType.string().uri().max(500).optional())
  avatar?: string;

  @Rule(RuleType.number().valid(0, 1, 2).optional())
  gender?: number;

  @Rule(RuleType.string().max(100).optional())
  region?: string;

  @Rule(RuleType.string().max(500).optional())
  bio?: string;
}

/** 修改密码 DTO */
export class ChangePasswordDTO {
  @Rule(RuleType.string().min(1).required())
  oldPassword!: string;

  @Rule(RuleType.string().min(8).max(20).required())
  newPassword!: string;
}
