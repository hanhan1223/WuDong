import { Provide, Inject } from "@midwayjs/core";
import { PrismaClient } from "@prisma/client";

@Provide()
export class CartService {
  @Inject("prisma")
  prisma!: PrismaClient;

  /** 添加到购物车 */
  async addItem(
    userId: number,
    productId: number,
    skuId?: number,
    quantity = 1,
  ) {
    // 检查商品是否存在
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.status !== "ACTIVE")
      throw new Error("商品不存在或已下架");

    // 检查是否已在购物车中
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_skuId: { userId, productId, skuId: skuId || 0 },
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, skuId: skuId || 0, quantity, selected: true },
    });
  }

  /** 获取购物车列表 */
  async findByUser(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        // Note: CartItem doesn't have direct product relation in schema
        // We'll need to join manually or add relation
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** 更新数量 */
  async updateQuantity(userId: number, itemId: number, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.userId !== userId) throw new Error("购物车项不存在");

    if (quantity <= 0) {
      return this.prisma.cartItem.delete({ where: { id: itemId } });
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /** 删除购物车项 */
  async removeItem(userId: number, itemId: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.userId !== userId) throw new Error("购物车项不存在");
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  /** 清空购物车 */
  async clear(userId: number) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }

  /** 选中/取消选中 */
  async toggleSelect(userId: number, itemId: number, selected: boolean) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.userId !== userId) throw new Error("购物车项不存在");
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { selected },
    });
  }

  /** 获取选中的购物车项（用于结算） */
  async findSelected(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId, selected: true },
    });
  }
}
