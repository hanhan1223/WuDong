---
name: test-backend
description: 运行后端测试并生成测试报告
user_invocable: true
---

# 后端测试运行

运行后端项目的测试套件并生成报告。

## 测试类型

### 1. 单元测试

- Service 层业务逻辑测试
- 工具函数测试
- 数据验证测试

### 2. 集成测试

- API 接口测试
- 数据库操作测试
- 中间件测试

### 3. 测试覆盖率目标

- 语句覆盖率 ≥ 60%
- 分支覆盖率 ≥ 50%
- 函数覆盖率 ≥ 60%

## 运行命令

根据项目配置自动检测并运行：

```bash
# npm 项目
npm test

# 带覆盖率
npm run test:coverage

# 监听模式
npm run test:watch

# 指定测试文件
npm test -- --testPathPattern=user.test.ts
```

## 测试文件规范

- 文件命名：`{name}.test.ts` 或 `{name}.spec.ts`
- 位置：与被测文件同级的 `__tests__` 目录
- 命名规范：`describe` 使用中文描述，`it` 使用 "应该xxx" 格式

## 输出格式

```
📊 测试报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 通过: XX 个
❌ 失败: XX 个
⏭️ 跳过: XX 个

📈 覆盖率
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
语句: XX%
分支: XX%
函数: XX%
行:   XX%

❌ 失败详情
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[测试名称]
- 错误信息
- 堆栈跟踪
```

## 测试示例

```typescript
describe("用户服务", () => {
  describe("创建用户", () => {
    it("应该成功创建用户", async () => {
      // Arrange
      const userData = { phone: "13800138000", password: "test123" };

      // Act
      const user = await userService.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.phone).toBe(userData.phone);
    });

    it("应该拒绝重复手机号", async () => {
      // 测试重复注册场景
    });
  });
});
```
