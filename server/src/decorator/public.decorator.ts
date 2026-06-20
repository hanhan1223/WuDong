/**
 * 标记接口为公开访问（文档用途）
 * 实际鉴权逻辑在 JwtGuard 中通过路径匹配实现
 */
export const PUBLIC_KEY = "Public";
export const Public = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 仅作标记，不做实际处理
    return descriptor;
  };
};
