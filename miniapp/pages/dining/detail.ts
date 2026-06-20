import { get, post } from "../../services/request";
import { showLoading, hideLoading, showToast } from "../../utils/util";

Page({
  data: {
    restaurant: null as any,
    dishes: [] as any[],
    timeSlots: [] as any[],
    selectedDate: "",
    selectedSlot: null as any,
    guestCount: 2,
    contactName: "",
    contactPhone: "",
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadDetail(options.id);
    }
    this.setData({ selectedDate: this.getToday() });
  },

  getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  async loadDetail(id: string) {
    showLoading();
    try {
      const [restaurant, dishes, timeSlots] = await Promise.all([
        get<any>(`/restaurant/${id}`),
        get<any[]>(`/restaurant/${id}/dishes`).catch(() => []),
        get<any[]>(`/restaurant/${id}/timeslots`).catch(() => []),
      ]);
      this.setData({ restaurant, dishes, timeSlots });
    } catch (err) {
      showToast("加载失败");
    } finally {
      hideLoading();
    }
  },

  onDateChange(e: any) {
    this.setData({ selectedDate: e.detail.value });
  },

  onSlotTap(e: any) {
    this.setData({ selectedSlot: e.currentTarget.dataset.slot });
  },

  onGuestCountChange(e: any) {
    const type = e.currentTarget.dataset.type;
    let count = this.data.guestCount;
    if (type === "minus" && count > 1) count--;
    if (type === "plus" && count < 20) count++;
    this.setData({ guestCount: count });
  },

  onNameInput(e: any) {
    this.setData({ contactName: e.detail.value });
  },

  onPhoneInput(e: any) {
    this.setData({ contactPhone: e.detail.value });
  },

  async onBook() {
    const { selectedSlot, contactName, contactPhone } = this.data;
    if (!selectedSlot) {
      showToast("请选择时段");
      return;
    }
    if (!contactName) {
      showToast("请输入姓名");
      return;
    }
    if (!contactPhone) {
      showToast("请输入手机号");
      return;
    }

    showLoading();
    try {
      await post("/booking/create", {
        restaurantId: this.data.restaurant.id,
        bookingDate: this.data.selectedDate,
        timeSlotId: selectedSlot.id,
        guestCount: this.data.guestCount,
        contactName,
        contactPhone,
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
