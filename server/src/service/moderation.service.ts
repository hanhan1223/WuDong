import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";

@Provide()
export class ModerationService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 检查内容是否包含敏感词 */
  async checkContent(
    content: string,
  ): Promise<{ passed: boolean; hits: string[] }> {
    const words = await this.prisma.sensitiveWord.findMany({
      where: { status: true },
    });

    const hits: string[] = [];
    for (const word of words) {
      if (content.includes(word.word)) {
        hits.push(word.word);
      }
    }

    return {
      passed: hits.length === 0,
      hits,
    };
  }

  /** 审核内容（自动+标记） */
  async moderate(
    userId: number,
    content: string,
    targetType: string,
    targetId: number,
  ) {
    const result = await this.checkContent(content);

    if (result.passed) {
      return { approved: true, muted: false, hits: [] };
    }

    // 3+ sensitive words in single content → mute 24 hours
    if (result.hits.length >= 3) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: "MUTED" },
      });

      await this.prisma.message.create({
        data: {
          userId,
          type: "SYSTEM",
          title: "账号禁言通知",
          content: `您的内容包含违规信息，已被禁言 24 小时。命中敏感词：${result.hits.join("、")}`,
        },
      });

      return { approved: false, muted: true, hits: result.hits };
    }

    return { approved: false, muted: false, hits: result.hits };
  }
}
