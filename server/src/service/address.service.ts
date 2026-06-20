import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";

@Provide()
export class AddressService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 创建地址 */
  async create(
    userId: number,
    data: {
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detail: string;
      isDefault?: boolean;
    },
  ) {
    // 如果设为默认地址，先取消其他默认
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 如果是用户第一个地址，自动设为默认
    const count = await this.prisma.address.count({ where: { userId } });
    const isDefault = data.isDefault || count === 0;

    return this.prisma.address.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        province: data.province,
        city: data.city,
        district: data.district,
        detail: data.detail,
        isDefault,
      },
    });
  }

  /** 用户地址列表 */
  async findByUser(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  /** 更新地址 */
  async update(
    addressId: number,
    userId: number,
    data: Partial<{
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detail: string;
    }>,
  ) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("地址不存在");
    }
    if (address.userId !== userId) {
      throw new Error("无权操作此地址");
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  /** 删除地址 */
  async delete(addressId: number, userId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("地址不存在");
    }
    if (address.userId !== userId) {
      throw new Error("无权操作此地址");
    }

    await this.prisma.address.delete({ where: { id: addressId } });

    // 如果删除的是默认地址，将最新的一个地址设为默认
    if (address.isDefault) {
      const latest = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (latest) {
        await this.prisma.address.update({
          where: { id: latest.id },
          data: { isDefault: true },
        });
      }
    }
  }

  /** 设为默认地址 */
  async setDefault(addressId: number, userId: number) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("地址不存在");
    }
    if (address.userId !== userId) {
      throw new Error("无权操作此地址");
    }

    // 取消当前默认地址
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // 设置新默认地址
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
