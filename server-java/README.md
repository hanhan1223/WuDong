# 乌东文旅后端服务

> 乌东文旅"衣食住行"综合服务平台后端，提供 **Node.js (Midway.js)** 和 **Java (Spring Boot)** 两套实现，**任选其一启动即可**。

## 两套后端对比

| 对比项   | Node.js 版 (`server/`)   | Java 版 (`server-java/`)      |
| -------- | ------------------------ | ----------------------------- |
| 框架     | Midway.js 3 + TypeScript | Spring Boot 3.2 + Java 17     |
| ORM      | Prisma 5                 | Spring Data JPA (Hibernate 6) |
| 端口     | 7001                     | 7002                          |
| API 路径 | 完全一致                 | 完全一致                      |
| 数据库   | 共享同一个 MySQL         | 共享同一个 MySQL              |
| 响应格式 | `{code, message, data}`  | `{code, message, data}`       |
| 适合场景 | 快速原型、轻量部署       | 企业级开发、团队协作          |

> ⚠️ **重要提示**：两个后端共享同一个数据库，**不要同时启动**，选择其中一个即可。

---

## 快速开始

### 前置要求

| 依赖    | 版本 |
| ------- | ---- | ------------ |
| MySQL   | 8.0+ |
| Redis   | 7.x  |
| Node.js | 18+  | (Node.js 版) |
| Java    | 17+  | (Java 版)    |
| Maven   | 3.9+ | (Java 版)    |

### 方案一：启动 Node.js 后端

```bash
cd server
npm install
npx prisma generate       # 生成 Prisma 客户端
npx prisma migrate deploy # 执行数据库迁移
npm run dev                # 启动开发服务器 (端口 7001)
```

访问 Swagger 文档：http://localhost:7001/swagger-ui/index.html

### 方案二：启动 Java 后端

```bash
cd server-java
mvn spring-boot:run        # 启动开发服务器 (端口 7002)
```

访问 Swagger 文档：http://localhost:7002/swagger-ui.html

### Docker 部署（任选一个）

```bash
# 使用 docker-compose（在项目根目录执行）

# 启动 Node.js 后端
docker-compose up server

# 或者启动 Java 后端
docker-compose up server-java
```

---

## 项目结构

```
乌冬村/
├── server/                     # Node.js 后端 (Midway.js)
│   ├── src/
│   │   ├── controller/         # 15 个控制器
│   │   ├── service/            # 22 个服务
│   │   ├── prisma/             # 数据库 Schema
│   │   └── config/             # 配置
│   └── package.json
│
├── server-java/                # Java 后端 (Spring Boot)
│   ├── src/main/java/com/wudong/
│   │   ├── controller/         # 17 个控制器
│   │   ├── service/            # 22 个接口
│   │   │   └── impl/          # 22 个实现
│   │   ├── entity/             # 47 个 JPA 实体
│   │   ├── repository/         # 47 个仓储
│   │   ├── dto/                # 数据传输对象
│   │   ├── common/             # 枚举/响应/常量/异常
│   │   ├── config/             # 配置
│   │   ├── security/           # JWT 安全
│   │   └── interceptor/        # 拦截器
│   └── pom.xml
│
├── admin/                      # 管理后台前端 (React)
├── pc/                         # 游客 PC 端前端
├── miniapp/                    # 微信小程序
└── docker-compose.yml
```

---

## API 端点总览

两套后端暴露完全相同的 RESTful API，共 **80+ 个端点**：

| 模块     | 路径前缀                                                            | 端点数 | 说明           |
| -------- | ------------------------------------------------------------------- | ------ | -------------- |
| 用户     | `/api/users`                                                        | 7      | 注册/登录/信息 |
| 商品     | `/api/products`                                                     | 7      | 商品CRUD/搜索  |
| 订单     | `/api/orders`                                                       | 6      | 下单/取消/完成 |
| 购物车   | `/api/cart`                                                         | 8      | 增删改查/勾选  |
| 餐厅     | `/api/restaurants`                                                  | 5      | 餐厅/菜品/时段 |
| 预订     | `/api/bookings`                                                     | 2      | 餐桌预订       |
| 农产品   | `/api/farm`                                                         | 3      | 分类/商品      |
| 民宿     | `/api/homestays`                                                    | 5      | 房型/日历/预订 |
| 旅游     | `/api/scenic-spots`, `/api/routes`, `/api/transport-guides`         | 8      | 景点/路线/票务 |
| 社区     | `/api/posts`, `/api/comments`, `/api/topics`                        | 10     | 帖子/评论/关注 |
| 管理后台 | `/api/admin`                                                        | 22     | 用户/商家/财务 |
| 商家     | `/api/merchant`                                                     | 2      | 入驻申请       |
| 支付     | `/api/payments`                                                     | 4      | 创建/回调/退款 |
| 上传     | `/api/upload`                                                       | 1      | 图片上传       |
| 搜索     | `/api/search`                                                       | 2      | 全局搜索       |
| 通用     | `/api/reviews`, `/api/favorites`, `/api/messages`, `/api/addresses` | 15     | 评价/收藏/消息 |
| 健康检查 | `/api/health`                                                       | 1      | 服务状态       |

---

## 技术架构

### 后端分层

```
Controller (路由层)
    ↓
Service Interface (业务接口)
    ↓
Service Impl (业务实现)
    ↓
Repository (数据访问)
    ↓
MySQL / Redis
```

### 六大业务模块

| 模块 | 名称 | 核心功能                   |
| ---- | ---- | -------------------------- |
| 衣   | 商品 | 非遗工艺品电商、SKU、评价  |
| 食   | 餐厅 | 餐厅预订、餐桌管理、农产品 |
| 住   | 民宿 | 苗寨民宿预订、房型日历     |
| 行   | 旅游 | 景点门票、路线套餐、电子票 |
| 社区 | 社区 | 旅游攻略、笔记、关注、点赞 |
| 管理 | 管理 | 用户/商家/财务/内容审核    |

### 共享服务

- **用户认证**：手机号 + 短信验证码 / 微信 OAuth
- **统一订单**：跨模块订单状态机
- **统一支付**：微信支付（小程序端必选）
- **内容审核**：敏感词过滤 + 自动禁言
- **图片上传**：OSS 存储 + 自动缩略图

---

## 数据库

两套后端共享同一个 MySQL 数据库，表结构完全一致。

- 字符集：`utf8mb4`（支持 Emoji）
- 引擎：InnoDB
- 隔离级别：READ-COMMITTED
- 共 33 张业务表

> Java 版配置 `spring.jpa.hibernate.ddl-auto=validate`，不会自动修改表结构。

---

## 环境配置

### Node.js 版

编辑 `server/.env`：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wudong
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-jwt-secret
```

### Java 版

编辑 `server-java/src/main/resources/application-dev.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/wudong?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
  data:
    redis:
      host: localhost
      port: 6379

jwt:
  secret: your-jwt-secret-must-be-at-least-256-bits-long
```

---

## 开发规范

- **API 规范**：RESTful，资源名小写复数，连字符分隔
- **响应格式**：统一 `{code, message, data}` 封装
- **分页参数**：`page`（从 1 开始）、`pageSize`（默认 20）
- **认证**：JWT Bearer Token，`Authorization: Bearer <token>`
- **权限**：三级角色（游客 / 商家 / 管理员）

---

## 许可证

本项目为课程设计作品，仅供学习交流使用。
