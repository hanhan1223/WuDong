import { Controller, Get } from "@midwayjs/core";
import { ApiTags, ApiOperation } from "@midwayjs/swagger";
import { Public } from "../decorator/public.decorator";
import { ResponseUtil } from "../common/types/response";

@ApiTags("health")
@Controller("/api")
export class HealthController {
  @Public()
  @Get("/health")
  @ApiOperation({ summary: "健康检查" })
  async health() {
    return ResponseUtil.success({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "乌东文旅 API",
      version: "1.0.0",
    });
  }
}
