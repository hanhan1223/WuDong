package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.entity.TableBooking;
import com.wudong.security.SecurityUtils;
import com.wudong.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@Tag(name = "预订")
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final RestaurantService restaurantService;

    @Operation(summary = "获取用户预订列表")
    @GetMapping
    public ApiResponse<Page<TableBooking>> getBookings(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(restaurantService.getUserBookings(userId, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "取消预订")
    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancelBooking(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        restaurantService.cancelBooking(id, userId);
        return ApiResponse.success(null, "预订已取消");
    }
}
