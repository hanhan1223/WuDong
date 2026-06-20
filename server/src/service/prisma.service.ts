import { Provide, Scope, ScopeEnum, Init, Destroy } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 数据库服务
 * 作为 Midway IoC 容器中的单例服务，供其他 Service 注入使用
 */
@Provide("prisma")
@Scope(ScopeEnum.Singleton)
export class PrismaService extends PrismaClient {
  @Init()
  async init() {
    await this.$connect();
  }

  @Destroy()
  async destroy() {
    await this.$disconnect();
  }
}
