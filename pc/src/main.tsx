import React from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import App from "./App";
import "./styles/global.css";

const theme = {
  token: {
    colorPrimary: "#1F5FA8",
    colorSuccess: "#52C41A",
    colorWarning: "#FAAD14",
    colorError: "#FF4D4F",
    borderRadius: 6,
    fontSize: 14,
  },
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
