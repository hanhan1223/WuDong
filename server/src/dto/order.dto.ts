import { Rule, RuleType } from "@midwayjs/validate";
import { OrderType, MerchantModule } from "@prisma/client";

/** 订单商品项 */
class OrderItemDTO {
  @Rule(RuleType.number().integer().positive().optional())
  productId?: number;

  @Rule(RuleType.string().min(1).max(200).required())
  productName!: string;

  @Rule(RuleType.string().uri().max(500).optional())
  productImage?: string;

  @Rule(RuleType.number().integer().positive().optional())
  skuId?: number;

  @Rule(RuleType.string().max(200).optional())
  skuName?: string;

  @Rule(RuleType.number().positive().precision(2).required())
  price!: number;

  @Rule(RuleType.number().integer().min(1).max(999).required())
  quantity!: number;
}

/** 创建订单 DTO */
export class CreateOrderDTO {
  @Rule(
    RuleType.string()
      .valid("PRODUCT", "TABLE_BOOKING", "ACCOMMODATION", "TICKET", "ROUTE")
      .required(),
  )
  orderType!: OrderType;

  @Rule(
    RuleType.string()
      .valid("CLOTHING", "DINING", "ACCOMMODATION", "TRAVEL")
      .required(),
  )
  module!: MerchantModule;

  @Rule(RuleType.array().items(RuleType.object()).min(1).max(50).required())
  items!: OrderItemDTO[];

  @Rule(RuleType.string().max(500).optional())
  remark?: string;
}

/** 取消订单 DTO */
export class CancelOrderDTO {
  @Rule(RuleType.string().min(1).max(500).required())
  reason!: string;
}
