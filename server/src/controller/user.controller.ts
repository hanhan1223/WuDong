import { Controller, Post, Put, Get, Body, Inject } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { AuthService } from "../service/auth.service";
import { UserService } from "../service/user.service";
import { ResponseUtil } from "../common/types/response";
import { IUserContext } from "../interface";
import { Public } from "../decorator/public.decorator";
import {
  RegisterDTO,
  LoginDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
} from "../dto/user.dto";

@ApiTags("user")
@Controller("/api/users")
export class UserController {
  @Inject()
  authService!: AuthService;

  @Inject()
  userService!: UserService;

  @Public()
  @Post("/register")
  @ApiOperation({ summary: "用户注册" })
  async register(@Body() body: RegisterDTO) {
    const result = await this.authService.register(body);
    return ResponseUtil.success(result, "注册成功");
  }

  @Public()
  @Post("/login")
  @ApiOperation({ summary: "密码登录" })
  async login(@Body() body: LoginDTO) {
    const result = await this.authService.loginByPassword(
      body.phone,
      body.password,
    );
    return ResponseUtil.success(result, "登录成功");
  }

  @Get("/profile")
  @ApiOperation({ summary: "获取个人资料" })
  async getProfile(ctx: Context) {
    const user = ctx.state.user as IUserContext;
    const profile = await this.userService.findById(user.userId);
    if (!profile) {
      return ResponseUtil.error("用户不存在", 404);
    }
    const { password, ...safeProfile } = profile;
    return ResponseUtil.success(safeProfile);
  }

  @Put("/profile")
  @ApiOperation({ summary: "更新个人资料" })
  async updateProfile(ctx: Context, @Body() body: UpdateProfileDTO) {
    const user = ctx.state.user as IUserContext;
    const updated = await this.userService.updateProfile(user.userId, body);
    return ResponseUtil.success(updated, "更新成功");
  }

  @Post("/change-password")
  @ApiOperation({ summary: "修改密码" })
  async changePassword(ctx: Context, @Body() body: ChangePasswordDTO) {
    const user = ctx.state.user as IUserContext;
    await this.userService.changePassword(
      user.userId,
      body.oldPassword,
      body.newPassword,
    );
    return ResponseUtil.success(null, "密码修改成功");
  }

  @Public()
  @Post("/send-sms")
  @ApiOperation({ summary: "发送验证码" })
  async sendSms(@Body() body: { phone: string }) {
    const result = await this.authService.sendSmsCode(body.phone);
    return ResponseUtil.success(result, "验证码已发送");
  }

  @Public()
  @Post("/login-sms")
  @ApiOperation({ summary: "验证码登录" })
  async loginBySms(@Body() body: { phone: string; code: string }) {
    const result = await this.authService.loginBySms(body.phone, body.code);
    return ResponseUtil.success(result, "登录成功");
  }
}
