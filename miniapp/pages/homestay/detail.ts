import { get, post } from "../../services/request";
import { showLoading, hideLoading, showToast } from "../../utils/util";

const app = getApp();

Page({
  data: {
    homestay: null as any,
    roomTypes: [] as any[],
    calendars: [] as any[],
    checkIn: "",
    checkOut: "",
    selectedRoom: null as any,
    guestName: "",
    guestPhone: "",
    guestIdCard: "",
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadDetail(options.id);
    }
    if (options.checkIn) this.setData({ checkIn: options.checkIn });
    if (options.checkOut) this.setData({ checkOut: options.checkOut });
  },

  async loadDetail(id: string) {
    showLoading();
    try {
      const homestay = await get<any>(`/homestay/${id}`);
      this.setData({ homestay, roomTypes: homestay.roomTypes || [] });
    } catch (err) {
      showToast("加载失败");
    } finally {
      hideLoading();
    }
  },

  onRoomSelect(e: any) {
    this.setData({ selectedRoom: e.currentTarget.dataset.room });
  },

  onGuestNameInput(e: any) {
    this.setData({ guestName: e.detail.value });
  },

  onGuestPhoneInput(e: any) {
    this.setData({ guestPhone: e.detail.value });
  },

  onGuestIdCardInput(e: any) {
    this.setData({ guestIdCard: e.detail.value });
  },

  async onBook() {
    const {
      selectedRoom,
      guestName,
      guestPhone,
      guestIdCard,
      checkIn,
      checkOut,
    } = this.data;
    if (!selectedRoom) {
      showToast("请选择房型");
      return;
    }
    if (!checkIn || !checkOut) {
      showToast("请选择入住和离店日期");
      return;
    }
    if (!guestName) {
      showToast("请输入入住人姓名");
      return;
    }
    if (!guestPhone) {
      showToast("请输入手机号");
      return;
    }

    if (!app.isLoggedIn()) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }

    showLoading();
    try {
      await post("/booking/create", {
        homestayId: this.data.homestay.id,
        roomTypeId: selectedRoom.id,
        checkIn,
        checkOut,
        guestName,
        guestPhone,
        guestIdCard,
      });
      showToast("预订成功", "success");
      wx.navigateBack();
    } catch (err) {
      // handled
    } finally {
      hideLoading();
    }
  },
});
