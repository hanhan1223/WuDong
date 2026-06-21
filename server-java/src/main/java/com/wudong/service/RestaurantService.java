package com.wudong.service;

import com.wudong.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * 餐厅服务 - 等价于 Node.js 版本的 RestaurantService
 */
public interface RestaurantService {

    /**
     * 获取餐厅列表
     */
    Page<Restaurant> getRestaurants(String keyword, Pageable pageable);

    /**
     * 获取餐厅详情
     */
    Restaurant getRestaurantById(Long id);

    /**
     * 获取餐厅菜品
     */
    List<RestaurantDish> getDishes(Long restaurantId);

    /**
     * 获取可用预订时段
     */
    List<TimeSlot> getTimeSlots(Long restaurantId);

    /**
     * 创建餐桌预订
     */
    TableBooking createBooking(Long restaurantId, Long userId, LocalDate bookingDate,
                               Long timeSlotId, Integer guestCount, String contactName,
                               String contactPhone, String remark);

    /**
     * 获取用户预订列表
     */
    Page<TableBooking> getUserBookings(Long userId, Pageable pageable);

    /**
     * 取消预订
     */
    void cancelBooking(Long bookingId, Long userId);

    /**
     * 获取农产品分类
     */
    List<FarmCategory> getFarmCategories();

    /**
     * 获取农产品列表
     */
    Page<FarmProduct> getFarmProducts(Long categoryId, String keyword, Pageable pageable);

    /**
     * 获取农产品详情
     */
    FarmProduct getFarmProductById(Long id);
}
