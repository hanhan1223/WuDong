package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.restaurant.CreateBookingRequest;
import com.wudong.entity.Restaurant;
import com.wudong.entity.RestaurantDish;
import com.wudong.entity.TableBooking;
import com.wudong.entity.TimeSlot;
import com.wudong.security.SecurityUtils;
import com.wudong.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "餐厅")
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @Operation(summary = "获取餐厅列表")
    @GetMapping
    public ApiResponse<Page<Restaurant>> getRestaurants(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(restaurantService.getRestaurants(keyword, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取餐厅详情")
    @GetMapping("/{id}")
    public ApiResponse<Restaurant> getRestaurant(@PathVariable Long id) {
        return ApiResponse.success(restaurantService.getRestaurantById(id));
    }

    @Operation(summary = "获取餐厅菜品")
    @GetMapping("/{id}/dishes")
    public ApiResponse<List<RestaurantDish>> getDishes(@PathVariable Long id) {
        return ApiResponse.success(restaurantService.getDishes(id));
    }

    @Operation(summary = "获取可用预订时段")
    @GetMapping("/{id}/timeslots")
    public ApiResponse<List<TimeSlot>> getTimeSlots(@PathVariable Long id) {
        return ApiResponse.success(restaurantService.getTimeSlots(id));
    }

    @Operation(summary = "创建餐桌预订")
    @PostMapping("/{id}/book")
    public ApiResponse<TableBooking> createBooking(@PathVariable Long id, @Valid @RequestBody CreateBookingRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        TableBooking booking = restaurantService.createBooking(id, userId, request.getBookingDate(),
                request.getTimeSlotId(), request.getGuestCount(), request.getContactName(),
                request.getContactPhone(), request.getRemark());
        return ApiResponse.success(booking, "预订成功");
    }
}
