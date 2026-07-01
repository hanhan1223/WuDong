import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始初始化数据...");

  // 1. 管理员角色
  const adminRole = await prisma.adminRole.upsert({
    where: { name: "超级管理员" },
    update: {},
    create: {
      name: "超级管理员",
      permissions: JSON.stringify(["*"]),
      description: "拥有所有权限",
    },
  });
  console.log("✅ 管理员角色创建完成");

  // 2. 默认管理员
  const hashedPassword = await bcrypt.hash("admin123456", 10);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "系统管理员",
      roleId: adminRole.id,
      status: "ACTIVE",
    },
  });
  console.log("✅ 默认管理员创建完成 (admin / admin123456)");

  // 3. 商品分类（幂等：已存在则跳过）
  const categories = [
    "苗族银饰",
    "蜡染制品",
    "苗绣工艺品",
    "民族服饰",
    "特色食品",
  ];
  for (let i = 0; i < categories.length; i++) {
    await prisma.productCategory.upsert({
      where: { id: i + 1 },
      update: {},
      create: { name: categories[i], sort: i + 1, status: true },
    });
  }
  console.log("✅ 商品分类创建完成");

  // 4. 农产品分类（幂等）
  const farmCategories = [
    "时令蔬菜",
    "山野干货",
    "手工腌制",
    "蜂蜜花茶",
    "米酒饮品",
  ];
  for (let i = 0; i < farmCategories.length; i++) {
    await prisma.farmCategory.upsert({
      where: { id: i + 1 },
      update: {},
      create: { name: farmCategories[i], sort: i + 1, status: true },
    });
  }
  console.log("✅ 农产品分类创建完成");

  // 5. 话题（幂等：按名称 upsert）
  const topics = [
    {
      name: "#乌东苗寨探秘#",
      description: "探索乌东苗寨的自然风光与人文历史",
      isTop: true,
      isRecommend: true,
    },
    {
      name: "#苗族非遗体验#",
      description: "体验苗族银饰、蜡染、苗绣等非物质文化遗产",
      isRecommend: true,
    },
    {
      name: "#乌东美食打卡#",
      description: "分享乌东特色美食与农家菜",
      isRecommend: true,
    },
    { name: "#梯田风光#", description: "记录乌东梯田的四季美景" },
    { name: "#苗族节庆#", description: "记录苗年、吃新节等传统节庆活动" },
  ];
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: { ...topic, status: true },
    });
  }
  console.log("✅ 话题创建完成");

  // 6. 系统配置
  const configs = [
    { key: "site_name", value: "乌东文旅", remark: "网站名称" },
    {
      key: "commission_rate_physical",
      value: "0.05",
      remark: "实物商品佣金比例",
    },
    { key: "commission_rate_service", value: "0.1", remark: "服务类佣金比例" },
    { key: "settlement_cycle_days", value: "7", remark: "结算周期（天）" },
  ];
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log("✅ 系统配置创建完成");

  // 7. 敏感词（幂等：按词 upsert）
  const words = ["赌博", "色情", "毒品", "暴力", "诈骗"];
  for (const word of words) {
    await prisma.sensitiveWord.upsert({
      where: { word },
      update: {},
      create: { word, level: 3, status: true },
    });
  }
  console.log("✅ 敏感词创建完成");

  console.log("🎉 数据初始化完成！");
}

main()
  .catch((e) => {
    console.error("❌ 初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
