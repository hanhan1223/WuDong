import { Provide } from "@midwayjs/core";
import { nanoid } from "nanoid";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

@Provide()
export class UploadService {
  private uploadDir = join(process.cwd(), "uploads");

  constructor() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /** 保存文件（开发环境用本地存储） */
  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ url: string; filename: string }> {
    const ext = originalName.split(".").pop() || "bin";
    const filename = `${nanoid(12)}.${ext}`;
    const filepath = join(this.uploadDir, filename);

    writeFileSync(filepath, buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
    };
  }

  /** 批量上传 */
  async uploadMultiple(
    files: Array<{ buffer: Buffer; originalName: string; mimeType: string }>,
  ) {
    const results = [];
    for (const file of files) {
      const result = await this.upload(
        file.buffer,
        file.originalName,
        file.mimeType,
      );
      results.push(result);
    }
    return results;
  }
}
