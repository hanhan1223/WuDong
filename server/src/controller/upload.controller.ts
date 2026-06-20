import { Controller, Post, Inject } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { UploadService } from "../service/upload.service";
import { ResponseUtil } from "../common/types/response";

@ApiTags("upload")
@Controller("/api/upload")
export class UploadController {
  @Inject()
  uploadService!: UploadService;

  @Post("/image")
  @ApiOperation({ summary: "上传图片" })
  async uploadImage(ctx: Context) {
    const file = (ctx.request as any).files?.file;
    if (!file) return ResponseUtil.error("请选择文件", 400);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return ResponseUtil.error("仅支持 jpg/png/webp/gif 格式", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return ResponseUtil.error("文件大小不能超过 5MB", 400);
    }

    const fs = require("fs");
    const buffer = fs.readFileSync(file.filepath);
    const result = await this.uploadService.upload(
      buffer,
      file.originalFilename,
      file.mimetype,
    );
    return ResponseUtil.success(result, "上传成功");
  }
}
