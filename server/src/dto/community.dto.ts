import { Rule, RuleType } from "@midwayjs/validate";

export class CreatePostDTO {
  @Rule(RuleType.string().min(1).max(200).required())
  title!: string;

  @Rule(RuleType.string().max(5000).optional())
  content?: string;

  @Rule(RuleType.array().items(RuleType.string()).max(9).optional())
  images?: string[];

  @Rule(RuleType.string().uri().max(500).optional())
  videoUrl?: string;

  @Rule(RuleType.number().integer().positive().optional())
  locationId?: number;

  @Rule(RuleType.string().max(20).optional())
  locationType?: string;

  @Rule(RuleType.string().max(100).optional())
  locationName?: string;

  @Rule(RuleType.array().items(RuleType.number()).optional())
  topicIds?: number[];
}

export class CreateCommentDTO {
  @Rule(RuleType.string().min(1).max(500).required())
  content!: string;

  @Rule(RuleType.number().integer().positive().optional())
  parentId?: number;

  @Rule(RuleType.number().integer().positive().optional())
  replyToUserId?: number;
}
