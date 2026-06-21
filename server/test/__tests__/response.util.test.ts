import { ResponseUtil } from "../../src/common/types/response";

describe("ResponseUtil", () => {
  describe("success", () => {
    it("should return success response with data", () => {
      const data = { id: 1, name: "测试" };
      const result = ResponseUtil.success(data);

      expect(result).toEqual({
        code: 200,
        message: "操作成功",
        data: { id: 1, name: "测试" },
      });
    });

    it("should use custom message when provided", () => {
      const result = ResponseUtil.success(null, "创建成功");

      expect(result).toEqual({
        code: 200,
        message: "创建成功",
        data: null,
      });
    });

    it("should handle null data", () => {
      const result = ResponseUtil.success(null);

      expect(result.data).toBeNull();
    });
  });

  describe("error", () => {
    it("should return error response with message and code", () => {
      const result = ResponseUtil.error("用户不存在", 404);

      expect(result).toEqual({
        code: 404,
        message: "用户不存在",
        data: null,
      });
    });

    it("should default to 500 status code", () => {
      const result = ResponseUtil.error("服务器错误");

      expect(result).toEqual({
        code: 500,
        message: "服务器错误",
        data: null,
      });
    });

    it("should default message to '操作失败'", () => {
      const result = ResponseUtil.error();

      expect(result.message).toBe("操作失败");
    });
  });

  describe("paginate", () => {
    it("should return paginated response", () => {
      const list = [
        { id: 1, name: "商品1" },
        { id: 2, name: "商品2" },
      ];
      const result = ResponseUtil.paginate(list, 50, 1, 20);

      expect(result).toEqual({
        code: 200,
        message: "操作成功",
        data: {
          list,
          total: 50,
          page: 1,
          pageSize: 20,
          totalPages: 3,
        },
      });
    });

    it("should calculate totalPages correctly", () => {
      const result = ResponseUtil.paginate([], 45, 1, 20);
      expect(result.data.totalPages).toBe(3);

      const result2 = ResponseUtil.paginate([], 40, 1, 20);
      expect(result2.data.totalPages).toBe(2);

      const result3 = ResponseUtil.paginate([], 0, 1, 20);
      expect(result3.data.totalPages).toBe(0);
    });

    it("should handle single page", () => {
      const result = ResponseUtil.paginate([{ id: 1 }], 1, 1, 20);
      expect(result.data.totalPages).toBe(1);
    });
  });
});
