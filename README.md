# 乌东文旅"衣食住行"综合服务平台

贵州乌东村苗族特色数字化旅游平台，覆盖**衣**（非遗商品）、**食**（餐饮美食）、**住**（住宿预订）、**行**（线路订票）、**社区**（照片分享）、**管理后台**六大模块。

---

## 技术栈

| 层级       | 技术                                            |
| ---------- | ----------------------------------------------- |
| 后端       | Midway.js 3.x + TypeScript + Prisma ORM + Redis |
| 管理后台   | React 18 + TypeScript + Vite 5 + Ant Design 5   |
| PC 端      | React 18 + TypeScript + Vite 5 + Ant Design 5   |
| 微信小程序 | 微信原生开发 + TypeScript                       |
| 数据库     | MySQL 8.0 + Redis 7                             |
| 部署       | Docker + Nginx + GitHub Actions CI/CD           |

---

## 项目结构

```
├── server/              # 后端 API 服务 (Midway.js)
│   ├── src/
│   │   ├── controller/  # 15 个控制器
│   │   ├── service/     # 22 个服务
│   │   ├── dto/         # 数据验证
│   │   ├── middleware/   # 中间件（安全/限流/日志）
│   │   ├── guard/       # JWT 鉴权守卫
│   │   ├── filter/      # 异常过滤器
│   │   ├── config/      # 配置文件
│   │   ├── common/      # 常量/工具
│   │   └── schedule/    # 定时任务
│   ├── prisma/
│   │   ├── schema.prisma # 数据库模型（33 个表）
│   │   └── seed.ts       # 种子数据
│   └── test/            # 测试文件
├── admin/               # 管理后台 (React Admin)
│   └── src/
│       ├── pages/       # 15 个管理页面
│       ├── components/  # 共享组件
│       ├── layouts/     # 布局
│       ├── store/       # 状态管理 (Zustand)
│       └── api/         # API 请求封装
├── pc/                  # PC 端前端 (React)
│   └── src/
│       ├── pages/       # 20 个页面
│       ├── layouts/     # 布局
│       ├── store/       # 状态管理
│       └── api/         # API 请求封装
├── miniapp/             # 微信小程序
│   ├── pages/           # 12 个页面模块
│   ├── services/        # API 服务
│   └── utils/           # 工具函数
├── scripts/
│   └── init.sql         # 数据库初始化脚本
├── docker/
│   ├── nginx/           # Nginx 配置
│   └── nginx-pc.conf    # PC 端 Nginx 配置
└── docker-compose.yml   # Docker 编排（6 个服务）
```

---

## 快速开始

### 环境要求

- **Node.js** >= 20.0.0
- **MySQL** >= 8.0
- **Redis** >= 7.0
- **npm** >= 10 或 **pnpm** >= 8

### 方式一：本地开发启动

#### 1. 克隆项目

```bash
git clone <仓库地址>
cd code
```

#### 2. 配置环境变量

```bash
cd server
cp .env.example .env
```

编辑 `server/.env` 文件，填入实际的数据库连接信息：

```env
# 数据库配置
DATABASE_URL="mysql://用户名:密码@主机:3306/数据库名?charset=utf8mb4"

# JWT 密钥（生产环境必须修改）
JWT_SECRET="你的JWT密钥"
JWT_EXPIRES_IN="7d"

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 服务端口
MIDWAY_SERVER_PORT=7001
MIDWAY_SERVER_HOST=0.0.0.0

# CORS 允许的前端地址
CORS_ORIGIN=http://localhost:8080
```

#### 3. 安装依赖

```bash
# 后端
cd server
npm install

# 管理后台
cd ../admin
npm install

# PC 端
cd ../pc
npm install
```

#### 4. 初始化数据库

```bash
cd server

# 生成 Prisma Client
npx prisma generate

# 同步数据库表结构
npx prisma db push

# 导入种子数据（管理员账号、分类、话题等）
npx prisma db seed
```

> **种子数据包含：**
>
> - 管理员账号：`admin` / `admin123456`
> - 5 个商品分类（苗族银饰、蜡染制品、苗绣工艺品、民族服饰、特色食品）
> - 5 个农产品分类
> - 5 个社区话题
> - 系统配置（佣金比例、结算周期等）
> - 示例敏感词库

#### 5. 启动服务

```bash
# 终端 1：启动后端 API（端口 7001）
cd server
npm run dev

# 终端 2：启动管理后台（端口 8080）
cd admin
npm run dev

# 终端 3：启动 PC 端（端口 3000）
cd pc
npm run dev
```

#### 6. 微信小程序

使用**微信开发者工具**打开 `miniapp/` 目录即可。

---

### 方式二：Docker 一键部署

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f server
```

启动后的服务地址：

| 服务         | 地址                             | 说明        |
| ------------ | -------------------------------- | ----------- |
| 后端 API     | http://localhost:7001            | RESTful API |
| Swagger 文档 | http://localhost:7001/swagger-ui | API 文档    |
| 管理后台     | http://localhost:8080            | 运营管理    |
| PC 端        | http://localhost:3000            | 游客端      |
| Nginx 入口   | http://localhost:80              | 统一入口    |

---

## 系统架构

### 三端架构

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  微信小程序  │  │   PC 端     │  │  管理后台   │
│  (游客端)   │  │  (游客端)   │  │  (运营端)   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                ┌───────▼───────┐
                │   Nginx 反代  │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │  后端 API 服务 │
                │  (Midway.js)  │
                └───────┬───────┘
                        │
              ┌─────────┼─────────┐
              │                   │
        ┌─────▼─────┐      ┌─────▼─────┐
        │  MySQL 8  │      │  Redis 7  │
        │ (业务数据) │      │ (缓存/限流)│
        └───────────┘      └───────────┘
```

### API 端点总览

| 模块       | 方法   | 路径                                 | 说明       |
| ---------- | ------ | ------------------------------------ | ---------- |
| **用户**   | POST   | `/api/users/register`                | 注册       |
|            | POST   | `/api/users/login`                   | 密码登录   |
|            | POST   | `/api/users/send-sms`                | 发送验证码 |
|            | POST   | `/api/users/login-sms`               | 验证码登录 |
|            | GET    | `/api/users/profile`                 | 获取资料   |
|            | PUT    | `/api/users/profile`                 | 更新资料   |
| **商品**   | GET    | `/api/products`                      | 商品列表   |
|            | GET    | `/api/products/:id`                  | 商品详情   |
|            | GET    | `/api/products/categories`           | 分类树     |
|            | GET    | `/api/products/hot`                  | 热门商品   |
| **购物车** | GET    | `/api/cart`                          | 购物车列表 |
|            | POST   | `/api/cart/add`                      | 添加商品   |
|            | POST   | `/api/cart/update`                   | 更新数量   |
|            | DELETE | `/api/cart/:id`                      | 删除商品   |
| **订单**   | POST   | `/api/orders/create`                 | 创建订单   |
|            | GET    | `/api/orders/list`                   | 订单列表   |
|            | GET    | `/api/orders/:id`                    | 订单详情   |
|            | POST   | `/api/orders/:id/confirm`            | 确认订单   |
|            | POST   | `/api/orders/:id/complete`           | 完成订单   |
|            | POST   | `/api/orders/:id/cancel`             | 取消订单   |
| **支付**   | POST   | `/api/payments/create`               | 创建支付单 |
|            | POST   | `/api/payments/callback`             | 支付回调   |
|            | POST   | `/api/payments/refund`               | 申请退款   |
| **餐饮**   | GET    | `/api/restaurants`                   | 餐厅列表   |
|            | GET    | `/api/restaurants/:id`               | 餐厅详情   |
|            | POST   | `/api/restaurants/:id/book`          | 预订餐位   |
|            | GET    | `/api/farm/products`                 | 农产品列表 |
| **住宿**   | GET    | `/api/homestays`                     | 民宿列表   |
|            | GET    | `/api/homestays/:id`                 | 民宿详情   |
|            | GET    | `/api/homestays/rooms/:id/calendar`  | 房态日历   |
|            | POST   | `/api/homestays/:id/book`            | 预订房间   |
| **旅行**   | GET    | `/api/scenic-spots`                  | 景区列表   |
|            | GET    | `/api/routes`                        | 路线套餐   |
|            | POST   | `/api/tickets/buy`                   | 购买门票   |
|            | GET    | `/api/e-tickets/:code`               | 电子票查询 |
|            | GET    | `/api/transport-guides`              | 交通攻略   |
| **社区**   | GET    | `/api/posts`                         | 游记列表   |
|            | POST   | `/api/posts`                         | 发布游记   |
|            | POST   | `/api/posts/:id/like`                | 点赞       |
|            | GET    | `/api/posts/:id/comments`            | 评论列表   |
|            | POST   | `/api/posts/:id/comments`            | 发表评论   |
|            | POST   | `/api/users/:id/follow`              | 关注/取关  |
|            | GET    | `/api/topics`                        | 话题列表   |
| **搜索**   | GET    | `/api/search?q=关键词`               | 全文搜索   |
|            | GET    | `/api/search/history`                | 搜索历史   |
| **评价**   | POST   | `/api/reviews`                       | 发表评价   |
|            | GET    | `/api/reviews?targetType=&targetId=` | 评价列表   |
| **收藏**   | POST   | `/api/favorites`                     | 切换收藏   |
|            | GET    | `/api/favorites`                     | 收藏列表   |
| **消息**   | GET    | `/api/messages`                      | 消息列表   |
|            | PUT    | `/api/messages/:id/read`             | 标记已读   |
|            | GET    | `/api/messages/unread-count`         | 未读数     |
| **地址**   | GET    | `/api/addresses`                     | 地址列表   |
|            | POST   | `/api/addresses`                     | 新增地址   |
|            | PUT    | `/api/addresses/:id`                 | 编辑地址   |
|            | DELETE | `/api/addresses/:id`                 | 删除地址   |
| **商家**   | POST   | `/api/merchant/apply`                | 入驻申请   |
|            | GET    | `/api/merchant/applications`         | 申请记录   |
| **上传**   | POST   | `/api/upload/image`                  | 上传图片   |
| **管理**   | POST   | `/api/admin/login`                   | 管理员登录 |
|            | GET    | `/api/admin/dashboard`               | 数据看板   |
|            | GET    | `/api/admin/users`                   | 用户管理   |
|            | GET    | `/api/admin/merchants`               | 商家管理   |
|            | GET    | `/api/admin/orders`                  | 订单管理   |
|            | GET    | `/api/admin/finance/records`         | 财务记录   |
|            | GET    | `/api/admin/reports`                 | 举报管理   |
|            | GET    | `/api/admin/logs`                    | 操作日志   |

---

## 核心功能

### 交易闭环

```
用户浏览 → 加入购物车 → 创建订单 → 支付 → 商家确认 → 服务进行 → 完成
                                    ↓
                              申请退款 → 审核 → 退款成功
```

### 商家入驻流程

```
用户提交申请 → 管理员审核 → 通过 → 创建商家记录 → 用户角色升级为商家
                    ↓
               拒绝（附原因）
```

### 内容审核机制

```
发布内容 → 敏感词检测 → 通过 → 正常展示
                ↓
          命中敏感词
          ├── 命中 < 3 个 → 标记待审核
          └── 命中 ≥ 3 个 → 自动禁言 24 小时
```

### 定时任务

| 任务         | 频率       | 说明                             |
| ------------ | ---------- | -------------------------------- |
| 自动完成订单 | 每天 02:00 | 已确认超过 7 天的订单自动完成    |
| 门票过期     | 每天 03:00 | 超过有效期的未使用电子票标记过期 |
| 自动结算     | 每天 04:00 | T+7 周期自动结算商家收入         |
| 解除禁言     | 每小时     | 满 24 小时自动解除用户禁言       |

---

## 数据库

### 核心表结构（33 个模型）

| 模块     | 表                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 用户体系 | users, merchants, merchant_applications, addresses                                                                                  |
| 统一订单 | orders, order_items, payments, refunds                                                                                              |
| 购物车   | cart_items                                                                                                                          |
| 衣-商品  | products, product_categories, product_skus, product_images                                                                          |
| 食-餐饮  | restaurants, restaurant_dishes, time_slots, table_bookings, farm_categories, farm_products                                          |
| 住-住宿  | homestays, room_types, room_calendars, checkin_rules                                                                                |
| 行-旅行  | scenic_spots, ticket_types, travel_routes, route_itineraries, e_tickets, transport_guides                                           |
| 社区     | posts, comments, topics, follows, likes, reports                                                                                    |
| 公共     | favorites, reviews, messages, search_history                                                                                        |
| 管理     | admin_users, admin_roles, operation_logs, announcements, banners, recommendations, finance_records, system_configs, sensitive_words |

---

## 开发规范

### API 规范

- RESTful 风格，资源用复数名词
- 统一响应格式：`{ code: number, message: string, data: T }`
- 分页响应：`{ list: T[], total, page, pageSize, totalPages }`
- 认证：JWT Bearer Token
- 错误码：200 成功、400 参数错误、401 未登录、403 无权限、404 不存在、500 服务错误

### Git 规范

- **main** — 生产分支
- **develop** — 开发分支
- **feature/\*** — 功能分支
- 提交信息：`类型(模块): 描述`，如 `feat(order): 添加退款接口`

### 安全机制

- JWT 认证 + 三角色 RBAC（游客/商家/管理员）
- 请求限流（Redis 滑动窗口）
- CSRF 防护（Origin 校验）
- XSS 防护（HTML 字段定向转义）
- 安全响应头（X-Content-Type-Options, X-Frame-Options）
- 参数化查询（Prisma ORM，防 SQL 注入）

---

## 性能目标

| 指标     | 目标            |
| -------- | --------------- |
| 页面加载 | ≤ 2s（4G 网络） |
| API 响应 | p95 ≤ 500ms     |
| 并发用户 | 1000            |
| 搜索响应 | ≤ 1s            |

---

## 许可证

本项目为课程设计作品，仅供学习交流使用。
