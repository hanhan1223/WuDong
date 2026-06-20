import axios, { AxiosResponse } from "axios";
import { message } from "antd";
import { useAuthStore } from "../store/useAuthStore";

/** API 统一响应格式 */
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

const request = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

// 防止 401 时多次跳转
let isRedirecting = false;

// 请求拦截器 - 注入 Token
request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理，保持 AxiosResponse 结构
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message: msg } = response.data;
    if (code === 200) {
      return response; // 保持 AxiosResponse 结构
    }
    message.error(msg || "请求失败");
    return Promise.reject(new Error(msg));
  },
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      useAuthStore.getState().logout();
      // 使用 setTimeout 确保状态更新完成后再跳转
      setTimeout(() => {
        window.location.href = "/login";
        isRedirecting = false;
      }, 100);
    } else if (error.response?.status !== 401) {
      message.error(error.response?.data?.message || "网络错误");
    }
    return Promise.reject(error);
  },
);

/** 类型安全的 GET 请求 */
export async function get<T = any>(url: string, params?: any): Promise<T> {
  const res = await request.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

/** 类型安全的 POST 请求 */
export async function post<T = any>(url: string, data?: any): Promise<T> {
  const res = await request.post<ApiResponse<T>>(url, data);
  return res.data.data;
}

export async function put<T = any>(url: string, data?: any): Promise<T> {
  const res = await request.put<ApiResponse<T>>(url, data);
  return res.data.data;
}

export async function del<T = any>(url: string): Promise<T> {
  const res = await request.delete<ApiResponse<T>>(url);
  return res.data.data;
}

export default request;
