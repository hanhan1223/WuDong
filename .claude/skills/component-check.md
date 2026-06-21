---
name: component-check
description: 检查前端组件是否符合复用规范和设计系统
user_invocable: true
---

# 前端组件规范检查

检查前端组件是否符合项目规范，确保代码复用和视觉一致性。

## 检查项

### 1. 必须封装的通用组件

以下组件必须封装，禁止各模块重复实现：

- `ProductCard` - 商品卡片
- `NavBar` / `TabBar` - 导航组件
- `FormUpload` - 表单上传组件
- `Modal` / `Dialog` - 弹窗组件
- `OrderStatus` - 订单状态组件
- `EmptyState` - 空状态组件
- `Loading` - 加载组件
- `Tag` / `Badge` - 标签徽章组件

### 2. 设计系统一致性

检查是否使用了设计规范中定义的 CSS 变量：

- 颜色：`--color-primary`, `--color-secondary-*`, `--color-text-*`
- 间距：`--space-*` (8px 栅格系统)
- 圆角：`--radius-*`
- 字号：`--font-size-*`
- 阴影：`--shadow-*`

### 3. 品牌色彩使用

- 主色：`#1F5FA8` (苗银蓝)
- 强调色：`#E85D2F` (苗绣暖橙)
- 成功色：`#6B8E3D` (梯田绿)
- 禁止使用硬编码颜色值

### 4. 字体规范

- 中文：阿里巴巴普惠体
- 数字：DIN Alternate Bold
- 正文：14px
- 行高：按字号 × 1.5 计算

### 5. 组件结构

```
ComponentName/
├── index.tsx        # 组件入口
├── index.module.css # 样式文件（或 styled-components）
├── types.ts         # TypeScript 类型定义
└── __tests__/       # 测试文件（可选）
```

## 输出格式

列出所有问题，按模块分组：

- 🔴 严重：重复实现通用组件
- 🟡 警告：未使用设计系统变量
- 🔵 建议：可优化项
