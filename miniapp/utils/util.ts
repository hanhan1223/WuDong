/** 格式化日期 */
export const formatDate = (
  date: string | Date,
  format = "YYYY-MM-DD HH:mm",
): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hour)
    .replace("mm", minute)
    .replace("ss", second);
};

/** 格式化价格 (分转元) */
export const formatPrice = (price: number): string => {
  return (price / 100).toFixed(2);
};

/** 显示提示 */
export const showToast = (
  title: string,
  icon: "success" | "error" | "none" = "none",
) => {
  wx.showToast({ title, icon });
};

/** 显示加载 */
export const showLoading = (title = "加载中...") => {
  wx.showLoading({ title, mask: true });
};

/** 隐藏加载 */
export const hideLoading = () => {
  wx.hideLoading();
};

/** 页面跳转 */
export const navigateTo = (url: string) => {
  wx.navigateTo({ url });
};

/** Tab 跳转 */
export const switchTab = (url: string) => {
  wx.switchTab({ url });
};

/** 返回上一页 */
export const navigateBack = (delta = 1) => {
  wx.navigateBack({ delta });
};

/** 确认弹窗 */
export const showConfirm = (
  content: string,
  title = "提示",
): Promise<boolean> => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success(res) {
        resolve(res.confirm);
      },
      fail() {
        resolve(false);
      },
    });
  });
};

/** 获取图片信息 */
export const chooseImage = (count = 9): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success(res) {
        resolve(res.tempFiles.map((f) => f.tempFilePath));
      },
      fail(err) {
        reject(err);
      },
    });
  });
};
