// getApp() 在函数内部调用，避免模块顶层初始化问题
let isRedirectingToLogin = false;

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  header?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

function request<T = any>(options: RequestOptions): Promise<T> {
  const app = getApp();
  return new Promise((resolve, reject) => {
    const header: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.header,
    };

    // 注入 Token
    if (app.globalData.token) {
      header["Authorization"] = `Bearer ${app.globalData.token}`;
    }

    wx.request({
      url: `${app.globalData.baseUrl}${options.url}`,
      method: options.method || "GET",
      data: options.data,
      header,
      success(res: any) {
        const data = res.data as ApiResponse<T>;
        if (data.code === 200) {
          resolve(data.data);
        } else if (data.code === 401) {
          // 防止多个并发 401 触发多次导航
          app.clearAuth();
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true;
            // 使用 reLaunch 清除整个导航栈，避免用户按返回键回到需认证页面
            wx.reLaunch({
              url: "/pages/login/index",
              complete: () => {
                setTimeout(() => {
                  isRedirectingToLogin = false;
                }, 1000);
              },
            });
          }
          reject(new Error("请先登录"));
        } else {
          wx.showToast({ title: data.message || "请求失败", icon: "none" });
          reject(new Error(data.message));
        }
      },
      fail(err) {
        wx.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
}

export const get = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: "GET", data });

export const post = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: "POST", data });

export const put = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: "PUT", data });

export const del = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: "DELETE", data });

export default request;
