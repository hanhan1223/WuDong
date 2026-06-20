# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

乌东文旅"衣食住行"综合服务平台 — a digital tourism platform for Wudong Village (乌东村), a Miao ethnic village in Guizhou, China. The platform covers clothing/crafts, dining, accommodation, travel, community sharing, and platform administration.

**Status**: Pre-development. Requirements (`需求分析.md`) and design spec (`视觉设计规范.md`) defined.

**Tech Stack**: Backend (cool-cli scaffold with TS), Frontend (React Admin + WeChat Mini Program), MySQL + Redis + OSS, Docker + CI/CD

## Architecture

### Three-Tier Architecture

- **Clients**: WeChat Mini Program (游客移动端), PC Web (游客/商家), Admin Web (管理后台)
- **Backend**: API Gateway → 6 domain services → shared service layer → data layer (MySQL/Redis/OSS)

### Six Independent Modules (6 student groups, parallel development)

| Group | Module             | Domain                                       | Key Data                      |
| ----- | ------------------ | -------------------------------------------- | ----------------------------- |
| 1     | 衣 (Clothing)      | Non-heritage crafts e-commerce               | Products, SKUs, reviews       |
| 2     | 食 (Dining)        | Restaurant booking + agricultural products   | Restaurants, tables, products |
| 3     | 住 (Accommodation) | Miao guesthouse booking                      | Rooms, availability calendar  |
| 4     | 行 (Travel)        | Tickets + route packages + e-tickets         | Scenic spots, tickets, routes |
| 5     | 社区 (Community)   | UGC travel notes/photos/videos               | Posts, comments, follows      |
| 6     | 管理后台 (Admin)   | Platform admin framework + system management | Users, merchants, finance     |

### Shared Services (cross-module dependencies)

All modules depend on: user auth, unified orders, unified cart (modules 1 & 2), unified payment (WeChat Pay), image/video upload (OSS), message notifications, and search.

### Order State Machine

```
待支付 → 已支付/待确认 → 已确认 → 进行中 → 已完成
  ↓          ↓               ↓           ↓
已取消    已退款         已退款       已退款/已评价
```

### Key Technical Decisions

- **Auth**: Phone + SMS verification code; WeChat OAuth; bcrypt password hashing
- **Payment**: WeChat Pay (required on Mini Program); Alipay optional on PC
- **Storage**: OSS for images/videos; auto-generate thumbnails; content moderation
- **Permissions**: 3 roles (游客/商家/管理员) with RBAC model
- **Security**: HTTPS, parameterized queries (ORM), XSS filtering, CSRF protection, content safety review

## Business Rules Summary

- Cart is shared between modules 1 (crafts) and 2 (agricultural products). Booking-type items (rooms/tables/tickets) bypass cart → direct order.
- Cancellation policies vary: accommodation (3-day free window), dining (24h), tickets (24h, 10% fee)
- Content moderation: auto-review on publish; 3+ sensitive hits → 24h mute
- Merchant onboarding: user applies → admin reviews (SLA 3 business days) → assigned to module
- Finance settlement: T+7 cycle; commission: 5% physical goods, 10% services

## Performance Targets

- Page load ≤ 2s (4G)
- API p95 ≤ 500ms
- 1000 concurrent users
- Search response ≤ 1s

## Visual Design System

Design spec: `视觉设计规范.md` (converted from `乌东文旅_衣食住行_视觉设计规范.docx`)

### Brand Colors

- **Primary (苗银蓝)**: `#1F5FA8` / Dark: `#0E3D75` / Light: `#E8F1FB`
- **Accent (苗绣橙)**: `#E85D2F`
- **Success (梯田绿)**: `#6B8E3D`
- **Gold (晨曦金)**: `#D4A14B`

### Design Tokens

CSS variables defined in `视觉设计规范.md` — use `--color-*`, `--space-*`, `--radius-*`, `--font-size-*`, `--shadow-*`.

### Typography

- Chinese: 阿里巴巴普惠体 (free for commercial use)
- Numbers: DIN Alternate Bold
- Base size: 14px (body), 8px grid spacing

### Cultural Design

苗族文化元素 (苗银纹样、蜡染靛蓝、苗绣暖橙、梯田、吊脚楼) integrated as brand visual identity. Traditional patterns should be modernized with geometric simplification.

## Development Standards

### Architecture Requirements

- **Frontend-backend separation**: Required. No monolithic coupling.
- **Backend layering**: Controller (路由) → Service (业务) → Repository (数据). Strict separation of concerns.
- **Data cold/hot separation**: MySQL for persistent business data; Redis for hot data caching with read/write invalidation strategy (sync delete cache on data update).

### API Standards (RESTful)

- Resources: lowercase plural nouns, hyphen-separated
- Methods: GET (read), POST (create), PUT (update), DELETE (delete)
- HTTP status codes: 200 success, 201 created, 400 bad request, 401 unauthorized, 404 not found, 500 server error

### Database Standards

- Engine: InnoDB
- Charset: `utf8mb4` (emoji support)
- Isolation level: READ-COMMITTED
- Core tables (users, products, orders, reviews) must have primary/foreign key ER relationships with appropriate indexes

### Git Workflow

- **Branches**: `main` (production), `develop` (integration), `feature/*` (feature branches)
- **GitHub flow**: Fork → Clone → feature branch → PR → Code Review → merge
- **Commit**: `git add` → standardized commit message → `push`
- Pre-push: AI auto code review

### Component Reuse

Frontend must encapsulate shared business components: product cards, navigation, form upload, modals, order status components. No duplicate code.

### Security

- **Auth**: Global JWT interceptor with 3-tier permissions (游客/普通用户/运营管理员)
- **Rate limiting**: Middleware to prevent API abuse
- **Distributed lock**: For flash sales to prevent overselling
- **Logging**: Full request/response chain logging; unified exception capture with standardized error format

### Frontend Delivery

- WeChat Mini Program (C端游客)
- React Admin (B端运营)

### Tooling & Deployment

- **Scaffolding**: `cool-cli` for standardized project skeleton (TS, CRUD, middleware out-of-box)
- **Containerization**: Docker for all services (dev/test/prod consistency)
- **CI/CD**: Auto-trigger on commit: ESLint → unit test → Docker build → deploy
- **Production**: Nginx reverse proxy + HTTPS; logging, performance, and exception monitoring
