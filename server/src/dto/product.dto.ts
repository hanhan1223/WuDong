import { Rule, RuleType } from "@midwayjs/validate";

export class CreateProductDTO {
  @Rule(RuleType.number().integer().positive().required())
  categoryId!: number;

  @Rule(RuleType.string().min(1).max(200).required())
  title!: string;

  @Rule(RuleType.string().max(500).optional())
  subtitle?: string;

  @Rule(RuleType.string().uri().max(500).required())
  mainImage!: string;

  @Rule(RuleType.number().positive().precision(2).required())
  price!: number;

  @Rule(RuleType.number().positive().precision(2).optional())
  marketPrice?: number;

  @Rule(RuleType.number().integer().min(0).optional())
  stock?: number;

  @Rule(RuleType.string().optional())
  detail?: string;

  @Rule(RuleType.string().optional())
  craftIntro?: string;

  @Rule(RuleType.string().max(50).optional())
  artisanName?: string;

  @Rule(RuleType.string().optional())
  artisanStory?: string;

  @Rule(RuleType.array().items(RuleType.object()).optional())
  skus?: Array<{
    specName: string;
    price: number;
    stock?: number;
    image?: string;
  }>;
}

export class UpdateProductDTO {
  @Rule(RuleType.number().integer().positive().optional())
  categoryId?: number;

  @Rule(RuleType.string().min(1).max(200).optional())
  title?: string;

  @Rule(RuleType.string().max(500).optional())
  subtitle?: string;

  @Rule(RuleType.string().uri().max(500).optional())
  mainImage?: string;

  @Rule(RuleType.number().positive().precision(2).optional())
  price?: number;

  @Rule(RuleType.number().positive().precision(2).optional())
  marketPrice?: number;

  @Rule(RuleType.number().integer().min(0).optional())
  stock?: number;

  @Rule(RuleType.string().optional())
  detail?: string;

  @Rule(RuleType.string().optional())
  craftIntro?: string;

  @Rule(RuleType.string().max(50).optional())
  artisanName?: string;

  @Rule(RuleType.string().optional())
  artisanStory?: string;
}
