---
name: db-schema
description: 生成符合项目规范的数据库表结构
user_invocable: true
---

# 数据库表结构生成

根据需求生成符合项目规范的 MySQL 表结构。

## 规范要求

### 基础配置

- 引擎：InnoDB
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci
- 事务隔离级别：READ-COMMITTED

### 命名规范

- 表名：小写下划线，复数形式（如 `users`, `products`）
- 字段名：小写下划线（如 `created_at`, `user_id`）
- 主键：`id`，自增 BIGINT
- 外键：`{关联表单数}_id`（如 `user_id`, `order_id`）
- 索引：`idx_{表名}_{字段名}`
- 唯一索引：`uk_{表名}_{字段名}`

### 必备字段

每张表必须包含：

```sql
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间'
```

### 索引策略

- 主键索引
- 外键字段必须建立索引
- 高频查询字段建立索引
- 唯一字段建立唯一索引

### 核心表参考

根据需求分析，核心表包括：

- 用户表 users
- 商家表 merchants
- 商品表 products
- 商品SKU表 product_skus
- 订单表 orders
- 订单项表 order_items
- 评价表 reviews
- 收藏表 favorites
- 餐厅表 restaurants
- 民宿表 homestays
- 房型表 rooms
- 景区表 scenic_spots
- 票种表 tickets
- 路线表 routes
- 游记表 travel_notes
- 评论表 comments
- 关注表 follows

## 输出格式

输出完整的 CREATE TABLE 语句，包含：

1. 表注释
2. 字段定义及注释
3. 索引定义
4. 外键约束（如有）
