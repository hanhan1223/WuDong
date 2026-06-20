import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { JwtPayload } from "../interface";

@Provide()
export class UserService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 根据ID查找用户 */
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /** 根据手机号查找用户 */
  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  /** 注册 */
  async register(data: { phone: string; password: string; nickname: string }) {
    const existing = await this.findByPhone(data.phone);
    if (existing) {
      throw new Error("该手机号已注册");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        password: hashedPassword,
        nickname: data.nickname,
      },
      select: { id: true, phone: true, nickname: true, role: true },
    });
  }

  /** 密码登录 */
  async loginByPassword(phone: string, password: string) {
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new Error("用户不存在");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("密码错误");
    }

    return user;
  }

  /** 更新用户资料 */
  async updateProfile(
    userId: number,
    data: Partial<
      Pick<User, "nickname" | "avatar" | "gender" | "region" | "bio">
    >,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        gender: true,
        region: true,
        bio: true,
        role: true,
      },
    });
  }

  /** 修改密码 */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.findById(userId);
    if (!user) throw new Error("用户不存在");

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new Error("原密码错误");

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }

  /** 生成 JWT Token 负载 */
  getTokenPayload(user: User): JwtPayload {
    return {
      userId: user.id,
      role: user.role as JwtPayload["role"],
      phone: user.phone,
    };
  }
}
