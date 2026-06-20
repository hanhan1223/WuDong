import { Rule, RuleType } from "@midwayjs/validate";

export class BuyTicketDTO {
  @Rule(RuleType.number().integer().positive().required())
  ticketTypeId!: number;

  @Rule(RuleType.number().integer().min(1).max(10).required())
  quantity!: number;

  @Rule(
    RuleType.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
  )
  validDate!: string;

  @Rule(RuleType.string().min(1).max(50).required())
  contactName!: string;

  @Rule(
    RuleType.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required(),
  )
  contactPhone!: string;
}
