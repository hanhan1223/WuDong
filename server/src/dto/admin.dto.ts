import { Rule, RuleType } from "@midwayjs/validate";

export class AdminLoginDTO {
  @Rule(RuleType.string().min(1).max(50).required())
  username!: string;

  @Rule(RuleType.string().min(1).required())
  password!: string;
}

export class ReviewMerchantDTO {
  @Rule(RuleType.string().valid("APPROVED", "REJECTED").required())
  action!: string;

  @Rule(RuleType.string().max(500).optional())
  reason?: string;
}

export class HandleReportDTO {
  @Rule(RuleType.string().valid("HANDLED", "REJECTED").required())
  action!: string;

  @Rule(RuleType.string().max(500).optional())
  result?: string;
}

export class CreateAnnouncementDTO {
  @Rule(RuleType.string().min(1).max(200).required())
  title!: string;

  @Rule(RuleType.string().min(1).required())
  content!: string;
}

export class CreateBannerDTO {
  @Rule(RuleType.string().min(1).max(100).required())
  title!: string;

  @Rule(RuleType.string().uri().max(500).required())
  imageUrl!: string;

  @Rule(RuleType.string().uri().max(500).optional())
  linkUrl?: string;

  @Rule(RuleType.string().max(20).optional())
  module?: string;

  @Rule(RuleType.number().integer().min(0).optional())
  sort?: number;
}

export class UpdateConfigDTO {
  @Rule(RuleType.string().min(1).max(100).required())
  key!: string;

  @Rule(RuleType.string().required())
  value!: string;
}
