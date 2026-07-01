import { Provide, Inject } from "@midwayjs/core";
import { JwtService } from "@midwayjs/jwt";
import { PrismaClient } from "@prisma/client";
import { UserService } from "./user.service";
import { CacheService } from "./cache.service";
import { JwtPayload } from "../interface";

@Provide()
export class AuthService {
  @Inject()
  jwtService!: JwtService;

  @Inject()
  userService!: UserService;

  @Inject()
  cacheService!: CacheService;

  @Inject("prisma")
  prisma!: PrismaClient;

  /** 密码登录并生成 Token */
  async loginByPassword(phone: string, password: string) {
    const user = await this.userService.loginByPassword(phone, password);
    if (user.status !== "ACTIVE") {
      throw new Error("账号已被禁用");
    }

    const payload = this.userService.getTokenPayload(user);
    const token = await this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  /** 注册并登录 */
  async register(data: { phone: string; password: string; nickname: string }) {
    const user = await this.userService.register(data);
    const payload: JwtPayload = {
      userId: user.id,
      role: user.role as JwtPayload["role"],
      phone: user.phone,
    };
    const token = await this.jwtService.sign(payload);

    return { token, user };
  }

  /** 验证 Token 并返回用户信息 */
  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify(token) as unknown as JwtPayload;
  }

  /** 发送验证码（存入 Redis，TTL 5 分钟） */
  async sendSmsCode(phone: string): Promise<{ code: string }> {
    const code = Math.random().toString().substring(2, 8);
    await this.cacheService.set(`sms:${phone}`, code, 300);
    console.log(`[SMS] 验证码发送至 ${phone}: ${code}`);
    return { code };
  }

  /** 验证码登录/注册 */
  async loginBySms(phone: string, code: string) {
    const cached = await this.cacheService.get<string>(`sms:${phone}`);
    if (!cached || cached !== code) {
      throw new Error("验证码错误或已过期");
    }
    // 清除验证码
    await this.cacheService.del(`sms:${phone}`);

    // 查找或创建用户（SMS 登录自动注册）
    let user = await this.userService.findByPhone(phone);
    if (!user) {
      // SMS 注册用户设置随机密码（不可用于密码登录），可通过忘记密码重置
      const randomPwd = await require("bcryptjs").hash(
        Math.random().toString(36).slice(2),
        10,
      );
      user = await this.prisma.user.create({
        data: {
          phone,
          password: randomPwd,
          nickname: `用户${phone.slice(-4)}`,
        },
      });
    }

    if (user.status !== "ACTIVE") throw new Error("账号已被禁用");

    const payload = this.userService.getTokenPayload(user as any);
    const token = await this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }
}
