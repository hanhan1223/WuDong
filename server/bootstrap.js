require("dotenv").config();
const { Bootstrap } = require("@midwayjs/bootstrap");

Bootstrap.run()
  .then(() => {
    console.log("乌东文旅 API 服务启动成功");
  })
  .catch((err) => {
    console.error("服务启动失败:", err);
    process.exit(1);
  });
