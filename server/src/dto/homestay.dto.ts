import { Rule, RuleType } from "@midwayjs/validate";

export class BookRoomDTO {
  @Rule(RuleType.number().integer().positive().required())
  roomTypeId!: number;

  @Rule(
    RuleType.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  )
  checkIn!: string;

  @Rule(
    RuleType.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  )
  checkOut!: string;

  @Rule(RuleType.number().integer().min(1).max(10).required())
  guestCount!: number;

  @Rule(RuleType.string().min(1).max(50).required())
  contactName!: string;

  @Rule(
    RuleType.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required(),
  )
  contactPhone!: string;

  @Rule(RuleType.string().max(500).optional())
  remark?: string;
}
