# 乌东文旅 · 衣食住行综合服务平台

乌东村苗族文化旅游数字化平台，涵盖非遗商品、餐饮美食、民宿预订、旅游出行、社区分享和平台管理六大模块。

## 🚀 快速开始

### 前置条件

- [Docker](https://www.docker.com/) & Docker Compose
- Git

### 一键启动

```bash
git clone <repo-url> wudong-tourism
cd wudong-tourism/code
docker compose up -d --build
```

### 访问地址

| 服务     | 地址                                        |
| -------- | ------------------------------------------- |
| 管理后台 | http://localhost:80                         |
| PC 端    | http://localhost:3000                       |
| API 文档 | http://localhost:7001/swagger-ui/index.html |

### 默认管理员

- 用户名：`admin`
- 密码：`admin123456`

---

## 🏗️ 项目架构

```
├── server/          # 后端 API（Node.js + MidwayJS + Prisma）
├── admin/           # 管理后台（React + Ant Design）
├── pc/              # PC 端（React + Ant Design）
├── docker/          # Nginx 配置 & SSL 证书
├── scripts/         # 初始化数据 SQL
└── docker-compose.yml
```

### 六大模块

| 模块     | 领域                                   |
| -------- | -------------------------------------- |
| 衣       | 苗族银饰、蜡染、苗绣等非遗手工艺品电商 |
| 食       | 餐厅预订 + 特色农产品商城              |
| 住       | 苗寨吊脚楼民宿预订                     |
| 行       | 景区门票 + 旅游路线 + 交通攻略         |
| 社区     | 游记分享、评论互动、话题广场           |
| 管理后台 | 用户管理、商家审核、订单管理、数据分析 |

### 技术栈

| 层     | 技术                                            |
| ------ | ----------------------------------------------- |
| 后端   | Node.js 20 + MidwayJS 3.x + Prisma + TypeScript |
| 前端   | React 18 + Ant Design 5 + Vite + TypeScript     |
| 数据库 | MySQL 8.0                                       |
| 缓存   | Redis 7                                         |
| 部署   | Docker + Nginx                                  |

---

## 📡 API 概览

### 公开接口

| 方法 | 路径                     | 说明       |
| ---- | ------------------------ | ---------- |
| POST | /api/users/register      | 注册       |
| POST | /api/users/login         | 密码登录   |
| POST | /api/users/login-sms     | 验证码登录 |
| POST | /api/users/send-sms      | 发送验证码 |
| GET  | /api/products            | 商品列表   |
| GET  | /api/products/:id        | 商品详情   |
| GET  | /api/restaurants         | 餐厅列表   |
| GET  | /api/homestays           | 民宿列表   |
| GET  | /api/scenic-spots        | 景区列表   |
| GET  | /api/routes              | 旅游路线   |
| GET  | /api/posts               | 游记列表   |
| GET  | /api/search?q=           | 全局搜索   |
| GET  | /api/admin/banners       | 轮播图     |
| GET  | /api/admin/announcements | 公告       |

启动后访问 **http://localhost:7001/swagger-ui/index.html** 查看完整 API 文档。

---

## 💻 本地开发

```bash
# 后端
cd server
cp .env.example .env   # 按需修改数据库地址
npm install
npm run dev             # http://localhost:7001

# 管理后台
cd admin
npm install
npm run dev             # http://localhost:8080

# PC 端
cd pc
npm install
npm run dev             # http://localhost:3000
```

前端 Vite 已配置 `/api` 代理到 `http://localhost:7001`。

---

## 🐳 Docker 服务

| 服务   | 端口   | 说明     |
| ------ | ------ | -------- |
| server | 7001   | 后端 API |
| admin  | 8080   | 管理后台 |
| pc     | 3000   | PC 端    |
| nginx  | 80/443 | 反向代理 |

```bash
docker compose up -d --build   # 构建并启动
docker compose ps               # 查看状态
docker compose logs -f server   # 查看后端日志
```

---

## 📁 关键文件

| 文件                          | 用途                               |
| ----------------------------- | ---------------------------------- |
| `server/.env`                 | 后端环境变量（数据库、Redis、JWT） |
| `server/.env.example`         | 环境变量模板                       |
| `server/prisma/schema.prisma` | 数据库模型（42 张表）              |
| `scripts/init.sql`            | 种子数据                           |
| `docker/nginx/nginx.conf`     | Nginx 配置                         |
| `CLAUDE.md`                   | AI 开发助手配置                    |
| `需求分析.md`                 | 业务需求文档                       |
| `视觉设计规范.md`             | 设计规范文档                       |
