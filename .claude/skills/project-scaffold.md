---
name: project-scaffold
description: 生成符合项目规范的目录结构和基础代码
user_invocable: true
---

# 项目脚手架生成

根据项目规范生成标准化的目录结构和基础代码。

## 后端项目结构 (Node.js/TypeScript)

```
server/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.ts   # 数据库配置
│   │   ├── redis.ts      # Redis 配置
│   │   └── jwt.ts        # JWT 配置
│   ├── middleware/        # 中间件
│   │   ├── auth.ts       # JWT 鉴权
│   │   ├── logger.ts     # 日志中间件
│   │   ├── rateLimit.ts  # 限流中间件
│   │   └── errorHandler.ts # 错误处理
│   ├── modules/          # 业务模块
│   │   ├── user/         # 用户模块
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.model.ts
│   │   │   └── user.routes.ts
│   │   ├── product/      # 商品模块
│   │   ├── order/        # 订单模块
│   │   ├── restaurant/   # 餐厅模块
│   │   ├── homestay/     # 民宿模块
│   │   ├── ticket/       # 票务模块
│   │   ├── community/    # 社区模块
│   │   └── admin/        # 管理后台模块
│   ├── common/           # 公共模块
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # 类型定义
│   │   └── constants/    # 常量定义
│   └── app.ts            # 应用入口
├── prisma/               # Prisma ORM (可选)
│   └── schema.prisma
├── tests/                # 测试文件
├── docker/               # Docker 配置
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example          # 环境变量示例
├── tsconfig.json
├── package.json
└── README.md
```

## 前端项目结构 (React Admin)

```
admin/
├── src/
│   ├── api/              # API 请求封装
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── order.ts
│   ├── components/       # 通用组件
│   │   ├── ProductCard/
│   │   ├── NavBar/
│   │   ├── Modal/
│   │   └── OrderStatus/
│   ├── pages/            # 页面组件
│   │   ├── dashboard/    # 数据看板
│   │   ├── user/         # 用户管理
│   │   ├── product/      # 商品管理
│   │   ├── order/        # 订单管理
│   │   └── content/      # 内容管理
│   ├── hooks/            # 自定义 Hooks
│   ├── store/            # 状态管理
│   ├── styles/           # 全局样式
│   │   ├── variables.css # CSS 变量（设计 Token）
│   │   └── global.css
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   └── App.tsx
├── public/
├── docker/
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 微信小程序项目结构

```
miniapp/
├── pages/                # 页面
│   ├── index/            # 首页
│   ├── clothing/         # 衣模块
│   ├── dining/           # 食模块
│   ├── homestay/         # 住模块
│   ├── travel/           # 行模块
│   ├── community/        # 社区模块
│   └── user/             # 个人中心
├── components/           # 组件
│   ├── ProductCard/
│   ├── NavBar/
│   └── TabBar/
├── services/             # API 服务
├── store/                # 状态管理
├── utils/                # 工具函数
├── styles/               # 样式
│   └── variables.scss    # SCSS 变量
├── app.ts
├── app.json
└── project.config.json
```

## 生成内容

根据用户指定的模块，生成：

1. 目录结构
2. 基础 Controller/Service/Repository 模板
3. 类型定义
4. 路由配置
5. 中间件配置
