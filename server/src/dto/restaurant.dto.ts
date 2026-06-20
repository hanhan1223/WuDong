import { Rule, RuleType } from "@midwayjs/validate";

export class CreateBookingDTO {
  @Rule(RuleType.date().required())
  bookingDate!: Date;

  @Rule(RuleType.number().integer().positive().required())
  timeSlotId!: number;

  @Rule(RuleType.number().integer().min(1).max(20).required())
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
