# 乌东文旅"衣食住行"综合服务平台 — 后端服务

> 贵州雷山乌东苗寨数字化文旅平台后端，覆盖**衣、食、住、行、社区、管理**六大业务模块。
>
> 提供 **Node.js (Midway.js)** 和 **Java (Spring Boot)** 两套完整实现，**任选其一启动即可**。

---

## 目录

- [业务模块介绍](#业务模块介绍)
- [技术栈对比](#技术栈对比)
- [环境准备](#环境准备)
- [启动方式一：Node.js 后端](#启动方式一nodejs-后端)
- [启动方式二：Java 后端](#启动方式二java-后端)
- [Docker 一键部署](#docker-一键部署)
- [API 文档与测试](#api-文档与测试)
- [项目结构](#项目结构)
- [数据库说明](#数据库说明)
- [开发规范](#开发规范)

---

## 业务模块介绍

### 🧵 衣 — 非遗工艺品电商

> 苗绣、银饰、蜡染等非遗工艺品的在线展示与销售。

- **商品管理**：多规格 SKU、商品图片轮播、工艺师故事介绍
- **分类浏览**：按品类（苗绣、银饰、蜡染等）筛选，支持关键词搜索
- **购物车**：加入购物车、修改数量、勾选结算、批量操作
- **订单流程**：下单 → 支付 → 发货 → 收货 → 评价
- **热销推荐**：按销量排序的热门商品榜单

**核心 API**：`/api/products`、`/api/cart`、`/api/orders`

---

### 🍜 食 — 餐厅预订与农产品

> 乌东村特色餐厅在线预订，以及当地农产品电商。

- **餐厅浏览**：餐厅列表、菜品展示、营业时段
- **餐桌预订**：选择日期 → 时段 → 人数 → 联系信息，实时查询可用桌数
- **农产品商城**：时令蔬果、腊肉、米酒等土特产分类展示
- **预订管理**：查看/取消我的预订记录

**核心 API**：`/api/restaurants`、`/api/bookings`、`/api/farm`

---

### 🏠 住 — 苗寨民宿预订

> 乌东苗寨特色吊脚楼民宿的在线预订。

- **民宿浏览**：民宿列表、详细介绍、实拍图片
- **房型展示**：房型列表、面积、价格、设施说明
- **日历查询**：按日期查看房间可用状态（可订/已满/维护中）
- **预订下单**：选择入住/退房日期 → 联系人 → 生成订单
- **入住规则**：民宿自定义的入住时间、退房时间、押金等规则

**核心 API**：`/api/homestays`

---

### 🚌 行 — 景点门票与旅游路线

> 西江千户苗寨、雷公山等周边景点的门票与路线服务。

- **景点浏览**：景点列表、介绍、图片、位置信息
- **门票购买**：选择票种 → 数量 → 联系人 → 生成电子票
- **电子票**：唯一票码，支持核销，有效期管理
- **路线套餐**：多日游路线、每日行程安排、包含项目说明
- **交通指南**：从各地到乌东村的交通方式（自驾/高铁/大巴）

**核心 API**：`/api/scenic-spots`、`/api/tickets`、`/api/routes`、`/api/e-tickets`、`/api/transport-guides`

---

### 💬 社区 — 旅游分享社区

> 游客发布旅游攻略、笔记、照片，互动交流。

- **帖子发布**：富文本内容、多图上传、视频、位置标记、话题关联
- **浏览与搜索**：按话题/关键词筛选帖子
- **互动功能**：点赞帖子/评论、收藏、关注其他用户
- **评论系统**：一级评论 + 子评论（回复）
- **话题广场**：热门话题标签，按关注数排序
- **内容审核**：敏感词自动过滤，违规内容拦截，多次违规自动禁言

**核心 API**：`/api/posts`、`/api/comments`、`/api/topics`

---

### ⚙️ 管理后台 — 平台运营管理

> 平台管理员使用的后台管理功能。

- **数据看板**：用户数、商家数、订单数、今日 GMV 等核心指标
- **用户管理**：用户列表、状态管理（正常/禁言/封禁）
- **商家审核**：商家入驻申请审核（通过/驳回），审核 SLA 3 个工作日
- **订单管理**：全平台订单查看、状态筛选
- **财务管理**：结算记录、T+7 结算周期、佣金比例（实物 5%、服务 10%）
- **举报处理**：用户举报审核与处理
- **内容管理**：公告发布、Banner 管理、推荐位配置
- **敏感词管理**：敏感词库的增删查
- **操作日志**：管理员操作审计日志
- **系统配置**：平台参数动态配置

**核心 API**：`/api/admin`

---

## 技术栈对比

| 对比项   | Node.js 版 (`server/`)  | Java 版 (`server-java/`)                                   |
| -------- | ----------------------- | ---------------------------------------------------------- |
| 语言     | TypeScript              | Java 17                                                    |
| 框架     | Midway.js 3             | Spring Boot 3.2.5                                          |
| ORM      | Prisma 5                | Spring Data JPA (Hibernate 6)                              |
| 认证     | JWT (jsonwebtoken)      | JWT (jjwt) + Spring Security                               |
| 缓存     | ioredis                 | Spring Data Redis (Lettuce)                                |
| API 文档 | Swagger                 | SpringDoc OpenAPI 2.x                                      |
| 构建工具 | npm                     | Maven 3.9+                                                 |
| 服务端口 | 7001                    | 7002                                                       |
| API 路径 | 完全一致                | 完全一致                                                   |
| 数据库   | 共享同一个 MySQL        | 共享同一个 MySQL                                           |
| 响应格式 | `{code, message, data}` | `{code, message, data}`                                    |
| 代码分层 | Controller → Service    | Controller → Service Interface → Service Impl → Repository |
| 适合场景 | 快速原型、轻量部署      | 企业级开发、多人协作                                       |

> ⚠️ **重要提示**：两个后端共享同一个数据库，**不要同时启动**，选择其中一个即可。

---

## 环境准备

无论选择哪个后端，都需要先准备好 MySQL 和 Redis。

### 1. 安装 MySQL 8.0

```bash
# Windows: 下载安装 https://dev.mysql.com/downloads/installer/
# macOS:
brew install mysql@8.0
brew services start mysql@8.0

# Ubuntu/Debian:
sudo apt install mysql-server
sudo systemctl start mysql
```

安装完成后创建数据库：

```sql
mysql -u root -p

CREATE DATABASE wudong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 安装 Redis 7.x

```bash
# Windows: 下载 https://github.com/tporadowski/redis/releases
# macOS:
brew install redis
brew services start redis

# Ubuntu/Debian:
sudo apt install redis-server
sudo systemctl start redis
```

### 3. 初始化数据库表结构

```bash
cd server
cp .env.example .env          # 复制环境变量（如没有 .env.example 则手动创建）
# 编辑 .env，配置数据库连接信息

npm install
npx prisma generate
npx prisma migrate deploy     # 执行数据库迁移，创建所有表
```

> 数据库初始化**只需要执行一次**，后续切换后端无需重复。

---

## 启动方式一：Node.js 后端

### 前置要求

- Node.js 18+
- npm 9+
- MySQL 8.0+（已初始化）
- Redis 7.x（已启动）

### 步骤

```bash
# 1. 进入 Node.js 后端目录
cd server

# 2. 安装依赖
npm install

# 3. 配置环境变量（如尚未配置）
# 编辑 .env 文件，填写数据库和 Redis 连接信息
```

`.env` 文件内容：

```env
# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wudong

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 密钥（自定义一个随机字符串）
JWT_SECRET=your-random-jwt-secret-string

# 服务端口
PORT=7001
```

```bash
# 4. 启动开发服务器
npm run dev
```

启动成功后会看到：

```
🚀 Server started on port 7001
```

### 验证

- 访问 API 文档：http://localhost:7001/swagger-ui/index.html
- 健康检查：http://localhost:7001/api/health

---

## 启动方式二：Java 后端

### 前置要求

- JDK 17+
- Maven 3.9+（或使用项目内 `mvnw`）
- MySQL 8.0+（已初始化）
- Redis 7.x（已启动）

### 步骤

```bash
# 1. 进入 Java 后端目录
cd server-java

# 2. 配置数据库连接
# 编辑 src/main/resources/application-dev.yml
```

`application-dev.yml` 关键配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/wudong?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8mb4
    username: root
    password: your_password # ← 改为你的 MySQL 密码
  data:
    redis:
      host: localhost
      port: 6379
      # password:                 # 如果 Redis 有密码，在此填写

jwt:
  secret: your-random-jwt-secret-key-must-be-at-least-256-bits-long-for-hs256 # ← 自定义
```

```bash
# 3. 编译项目
mvn clean compile

# 4. 启动服务
mvn spring-boot:run
```

启动成功后会看到：

```
Started WudongApplication in x.xx seconds
```

### 验证

- 访问 API 文档：http://localhost:7002/swagger-ui.html
- 健康检查：http://localhost:7002/api/health

### 可选：打包为 JAR 部署

```bash
# 打包
mvn clean package -DskipTests

# 运行 JAR（生产环境）
java -jar target/wudong-server-1.0.0.jar --spring.profiles.active=prod
```

---

## Docker 一键部署

### 使用 docker-compose（推荐）

在项目根目录执行：

```bash
# 启动 Node.js 后端 + MySQL + Redis
docker-compose up server

# 或者启动 Java 后端 + MySQL + Redis
docker-compose up server-java
```

### 单独构建 Java 镜像

```bash
cd server-java

# 构建镜像
docker build -t wudong-server-java .

# 运行容器
docker run -d -p 7002:7002 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-mysql-host \
  -e DB_PASSWORD=your-password \
  -e REDIS_HOST=your-redis-host \
  -e JWT_SECRET=your-jwt-secret \
  wudong-server-java
```

---

## API 文档与测试

### Swagger UI

启动后端后，访问 Swagger 页面可以直接测试所有 API：

| 后端    | Swagger 地址                                |
| ------- | ------------------------------------------- |
| Node.js | http://localhost:7001/swagger-ui/index.html |
| Java    | http://localhost:7002/swagger-ui.html       |

### API 测试流程

```
1. 调用 POST /api/users/send-sms 发送验证码
2. 调用 POST /api/users/register 注册账号（返回 token）
3. 在 Swagger 页面右上角点击 "Authorize"，输入 Bearer <token>
4. 之后的所有请求都会自动携带认证信息
```

### 全部 API 端点

| 模块     | 路径前缀                 | 端点数 | 说明                                                       |
| -------- | ------------------------ | ------ | ---------------------------------------------------------- |
| 用户     | `/api/users`             | 7      | 注册/登录/个人信息/修改密码                                |
| 商品     | `/api/products`          | 7      | 商品列表/详情/搜索/商家CRUD                                |
| 订单     | `/api/orders`            | 6      | 下单/取消/确认/完成/列表                                   |
| 购物车   | `/api/cart`              | 8      | 加购/删除/改数量/勾选结算                                  |
| 餐厅     | `/api/restaurants`       | 5      | 餐厅列表/详情/菜品/时段                                    |
| 预订     | `/api/bookings`          | 2      | 餐桌预订/我的预订                                          |
| 农产品   | `/api/farm`              | 3      | 分类列表/商品列表/详情                                     |
| 民宿     | `/api/homestays`         | 5      | 民宿列表/详情/房型/日历/预订                               |
| 景点     | `/api/scenic-spots`      | 2      | 景点列表/详情                                              |
| 门票     | `/api/tickets`           | 1      | 购买门票                                                   |
| 路线     | `/api/routes`            | 2      | 路线列表/详情                                              |
| 交通     | `/api/transport-guides`  | 1      | 交通指南列表                                               |
| 电子票   | `/api/e-tickets`         | 1      | 凭票码查询                                                 |
| 帖子     | `/api/posts`             | 5      | 发帖/编辑/删除/列表/详情                                   |
| 评论     | `/api/comments`          | 3      | 评论/子评论/点赞                                           |
| 话题     | `/api/topics`            | 1      | 话题列表                                                   |
| 关注     | `/api/users/{id}/follow` | 1      | 关注/取关                                                  |
| 评价     | `/api/reviews`           | 4      | 创建/列表/追评/商家回复                                    |
| 收藏     | `/api/favorites`         | 2      | 收藏/取关/列表                                             |
| 消息     | `/api/messages`          | 5      | 列表/已读/全部已读/未读数                                  |
| 地址     | `/api/addresses`         | 5      | CRUD/设默认                                                |
| 商家     | `/api/merchant`          | 2      | 入驻申请/我的申请                                          |
| 支付     | `/api/payments`          | 4      | 创建/回调/退款/查询                                        |
| 上传     | `/api/upload`            | 1      | 图片上传                                                   |
| 搜索     | `/api/search`            | 2      | 全局搜索/搜索历史                                          |
| 管理后台 | `/api/admin`             | 22     | 看板/用户/商家/订单/财务/举报/公告/Banner/配置/日志/敏感词 |
| 健康检查 | `/api/health`            | 1      | 服务状态                                                   |

**合计：80+ 个 API 端点**

---

## 项目结构

```
乌冬村/
├── server/                          # Node.js 后端
│   ├── src/
│   │   ├── controller/              # 控制器 (15 个)
│   │   ├── service/                 # 服务层 (22 个)
│   │   ├── prisma/
│   │   │   └── schema.prisma        # 数据库模型定义 (33 个模型)
│   │   ├── config/                  # 配置
│   │   ├── middleware/              # 中间件
│   │   └── schedule/                # 定时任务
│   ├── package.json
│   └── .env                         # 环境变量
│
├── server-java/                     # Java 后端
│   ├── src/main/java/com/wudong/
│   │   ├── WudongApplication.java   # 启动类
│   │   ├── controller/              # 控制器 (17 个)
│   │   ├── service/                 # 服务接口 (22 个)
│   │   │   └── impl/               # 服务实现 (22 个)
│   │   ├── entity/                  # JPA 实体 (47 个)
│   │   ├── repository/              # 数据仓储 (47 个)
│   │   ├── dto/                     # 数据传输对象
│   │   ├── common/
│   │   │   ├── enums/              # 业务枚举 (17 个)
│   │   │   ├── response/           # 统一响应封装
│   │   │   ├── constants/          # 业务常量
│   │   │   └── exception/          # 全局异常处理
│   │   ├── config/                  # Spring 配置
│   │   ├── security/                # JWT + Spring Security
│   │   └── interceptor/             # 拦截器 (限流/日志/安全)
│   ├── src/main/resources/
│   │   ├── application.yml          # 主配置
│   │   ├── application-dev.yml      # 开发环境
│   │   └── application-prod.yml     # 生产环境
│   ├── pom.xml
│   └── Dockerfile
│
├── admin/                           # 管理后台前端 (React)
├── pc/                              # 游客 PC 端前端
├── miniapp/                         # 微信小程序
└── docker-compose.yml               # Docker 编排
```

---

## 数据库说明

两套后端共享同一个 MySQL 数据库，共 **33 张业务表**：

| 分类   | 表名                                                                                                                                                                                           | 说明       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 用户   | `users`, `addresses`                                                                                                                                                                           | 用户与地址 |
| 商家   | `merchants`, `merchant_applications`                                                                                                                                                           | 商家与入驻 |
| 商品   | `product_categories`, `products`, `product_skus`, `product_images`                                                                                                                             | 商品体系   |
| 餐厅   | `restaurants`, `restaurant_dishes`, `time_slots`                                                                                                                                               | 餐厅菜品   |
| 农产品 | `farm_categories`, `farm_products`                                                                                                                                                             | 农产品     |
| 民宿   | `homestays`, `room_types`, `room_calendars`, `checkin_rules`                                                                                                                                   | 民宿房型   |
| 旅游   | `scenic_spots`, `ticket_types`, `travel_routes`, `route_itineraries`, `e_tickets`, `transport_guides`                                                                                          | 旅游票务   |
| 社区   | `posts`, `comments`, `topics`, `follows`, `likes`, `favorites`, `reports`                                                                                                                      | 社区互动   |
| 订单   | `orders`, `order_items`, `payments`, `refunds`, `cart_items`                                                                                                                                   | 交易体系   |
| 管理   | `admin_users`, `admin_roles`, `operation_logs`, `announcements`, `banners`, `recommendations`, `system_configs`, `sensitive_words`, `finance_records`, `reviews`, `messages`, `search_history` | 平台管理   |

**数据库规范**：

- 字符集：`utf8mb4`（支持 Emoji 和中文）
- 存储引擎：InnoDB（支持事务和外键）
- 隔离级别：READ-COMMITTED
- Java 版使用 `ddl-auto=validate`，不会自动修改表结构

---

## 开发规范

| 规范     | 说明                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| API 风格 | RESTful，资源名小写复数，连字符分隔                                                    |
| 响应格式 | 统一 `{code, message, data}`                                                           |
| 分页参数 | `page`（从 1 开始）、`pageSize`（默认 20，最大 100）                                   |
| 认证方式 | JWT Bearer Token，`Authorization: Bearer <token>`                                      |
| 权限模型 | 三级角色：游客（未登录）/ 普通用户 / 商家 / 管理员                                     |
| 状态码   | 200 成功、201 创建成功、400 参数错误、401 未认证、403 无权限、404 不存在、500 服务错误 |

---

## 许可证

本项目为贵州大学课程设计作品，仅供学习交流使用。
