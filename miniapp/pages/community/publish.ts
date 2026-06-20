import { publishPost } from "../../services/community";
import {
  chooseImage,
  showToast,
  showLoading,
  hideLoading,
} from "../../utils/util";

const app = getApp();

Page({
  data: {
    title: "",
    content: "",
    images: [] as string[],
    topicIds: [] as number[],
    locationName: "",
    loading: false,
  },

  onTitleInput(e: any) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e: any) {
    this.setData({ content: e.detail.value });
  },

  async onChooseImage() {
    try {
      const remaining = 9 - this.data.images.length;
      if (remaining <= 0) {
        showToast("最多上传9张图片");
        return;
      }
      const paths = await chooseImage(remaining);
      this.setData({ images: [...this.data.images, ...paths] });
    } catch (err) {
      // user cancelled
    }
  },

  onRemoveImage(e: any) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({
      images: this.data.images.filter((_, i) => i !== idx),
    });
  },

  onLocationInput(e: any) {
    this.setData({ locationName: e.detail.value });
  },

  async onSubmit() {
    const { title, content, images, locationName } = this.data;
    if (!title.trim()) {
      showToast("请输入标题");
      return;
    }
    if (!content.trim()) {
      showToast("请输入内容");
      return;
    }

    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }

    this.setData({ loading: true });
    showLoading("发布中...");
    try {
      await publishPost({
        title: title.trim(),
        content: content.trim(),
        images,
        locationName: locationName || undefined,
      });
      showToast("发布成功", "success");
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      // handled
    } finally {
      this.setData({ loading: false });
      hideLoading();
    }
  },
});
