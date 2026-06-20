import { get, post } from "./request";

/** 用户登录 */
export const login = (data: { phone: string; password: string }) =>
  post<{ token: string; user: any }>("/user/login", data);

/** 用户注册 */
export const register = (data: {
  phone: string;
  password: string;
  nickname: string;
}) => post<{ token: string; user: any }>("/user/register", data);

/** 获取个人资料 */
export const getProfile = () => get<any>("/user/profile");

/** 更新个人资料 */
export const updateProfile = (data: {
  nickname?: string;
  avatar?: string;
  gender?: number;
  region?: string;
  bio?: string;
}) => post<any>("/user/profile", data);

/** 修改密码 */
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
}) => post("/user/change-password", data);
