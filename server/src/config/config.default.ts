import { MidwayConfig } from "@midwayjs/core";

const JWT_SECRET = process.env.JWT_SECRET || "wudong-tourism-jwt-secret-2026";

export default {
  // Koa 应用密钥（用于 Cookie 签名等）
  keys: "wudong-tourism-app-keys-2026",

  // 服务端口
  koa: {
    port: parseInt(process.env.MIDWAY_SERVER_PORT || "7001"),
    hostname: process.env.MIDWAY_SERVER_HOST || "0.0.0.0",
  },

  // JWT 配置
  jwt: {
    secret: JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // Redis 配置
  redis: {
    client: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || "",
      db: parseInt(process.env.REDIS_DB || "0"),
    },
  },

  // Swagger API 文档
  swagger: {
    title: "乌东文旅 API",
    description: "乌东文旅衣食住行综合服务平台 API 文档",
    version: "1.0.0",
    tags: [
      { name: "user", description: "用户模块" },
      { name: "product", description: "商品模块" },
      { name: "order", description: "订单模块" },
      { name: "cart", description: "购物车模块" },
      { name: "restaurant", description: "餐饮模块" },
      { name: "homestay", description: "住宿模块" },
      { name: "ticket", description: "票务模块" },
      { name: "community", description: "社区模块" },
      { name: "admin", description: "管理后台" },
    ],
  },

  // 上传文件配置
  upload: {
    fileSize: "5mb",
    whitelist: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  },

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
    credentials: true,
  },
} as MidwayConfig;
