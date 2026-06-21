package com.wudong.service.impl;

import com.wudong.common.enums.BookingStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.CacheService;
import com.wudong.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 餐厅服务实现
 */
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantDishRepository dishRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final TableBookingRepository bookingRepository;
    private final FarmCategoryRepository farmCategoryRepository;
    private final FarmProductRepository farmProductRepository;
    private final CacheService cacheService;

    /**
     * 获取餐厅列表
     */
    @Override
    public Page<Restaurant> getRestaurants(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return restaurantRepository.searchByKeyword(keyword, pageable);
        }
        return restaurantRepository.findByStatusTrue(pageable);
    }

    /**
     * 获取餐厅详情
     */
    @Override
    public Restaurant getRestaurantById(Long id) {
        String cacheKey = com.wudong.common.constants.BusinessConstants.CACHE_PREFIX_RESTAURANT + id;
        Restaurant restaurant = cacheService.get(cacheKey);
        if (restaurant != null) {
            return restaurant;
        }

        restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new BusinessException("餐厅不存在", 404));

        // 加载菜品和时段
        restaurant.setDishes(dishRepository.findByRestaurantIdAndStatusTrue(id));
        restaurant.setTimeSlots(timeSlotRepository.findByRestaurantIdAndStatusTrue(id));

        cacheService.set(cacheKey, restaurant, 300);
        return restaurant;
    }

    /**
     * 获取餐厅菜品
     */
    @Override
    public List<RestaurantDish> getDishes(Long restaurantId) {
        return dishRepository.findByRestaurantIdAndStatusTrue(restaurantId);
    }

    /**
     * 获取可用预订时段
     */
    @Override
    public List<TimeSlot> getTimeSlots(Long restaurantId) {
        return timeSlotRepository.findByRestaurantIdAndStatusTrue(restaurantId);
    }

    /**
     * 创建餐桌预订
     */
    @Override
    @Transactional
    public TableBooking createBooking(Long restaurantId, Long userId, LocalDate bookingDate,
                                       Long timeSlotId, Integer guestCount, String contactName,
                                       String contactPhone, String remark) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new BusinessException("餐厅不存在", 404));

        // 检查预订容量
        long activeBookings = bookingRepository.countActiveBookings(restaurantId, bookingDate, timeSlotId);
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new BusinessException("时段不存在", 404));

        if (activeBookings >= timeSlot.getMaxBooking()) {
            throw new BusinessException("该时段已满，请选择其他时段");
        }

        TableBooking booking = new TableBooking();
        booking.setRestaurant(restaurant);
        booking.setUser(new User());
        booking.getUser().setId(userId);
        booking.setBookingDate(bookingDate);
        booking.setTimeSlotId(timeSlotId);
        booking.setGuestCount(guestCount);
        booking.setContactName(contactName);
        booking.setContactPhone(contactPhone);
        booking.setRemark(remark);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    /**
     * 获取用户预订列表
     */
    @Override
    public Page<TableBooking> getUserBookings(Long userId, Pageable pageable) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 取消预订
     */
    @Override
    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {
        TableBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BusinessException("预订不存在", 404));

        if (!booking.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此预订", 403);
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessException("预订状态不允许取消");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    /**
     * 获取农产品分类
     */
    @Override
    public List<FarmCategory> getFarmCategories() {
        return farmCategoryRepository.findByStatusTrueOrderBySortAsc();
    }

    /**
     * 获取农产品列表
     */
    @Override
    public Page<FarmProduct> getFarmProducts(Long categoryId, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            if (categoryId != null) {
                return farmProductRepository.searchByKeywordAndCategory(keyword, categoryId, pageable);
            }
            return farmProductRepository.searchByKeyword(keyword, pageable);
        }
        if (categoryId != null) {
            return farmProductRepository.findByCategoryIdAndStatusTrue(categoryId, pageable);
        }
        return farmProductRepository.findByStatusTrue(pageable);
    }

    /**
     * 获取农产品详情
     */
    @Override
    public FarmProduct getFarmProductById(Long id) {
        return farmProductRepository.findById(id)
                .orElseThrow(() -> new BusinessException("农产品不存在", 404));
    }
}
