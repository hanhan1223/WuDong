package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.homestay.BookRoomRequest;
import com.wudong.entity.Homestay;
import com.wudong.entity.Order;
import com.wudong.entity.RoomCalendar;
import com.wudong.entity.RoomType;
import com.wudong.security.SecurityUtils;
import com.wudong.service.HomestayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "民宿")
@RestController
@RequestMapping("/api/homestays")
@RequiredArgsConstructor
public class HomestayController {

    private final HomestayService homestayService;

    @Operation(summary = "获取民宿列表")
    @GetMapping
    public ApiResponse<Page<Homestay>> getHomestays(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(homestayService.getHomestays(keyword, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取民宿详情")
    @GetMapping("/{id}")
    public ApiResponse<Homestay> getHomestay(@PathVariable Long id) {
        return ApiResponse.success(homestayService.getHomestayById(id));
    }

    @Operation(summary = "获取房型列表")
    @GetMapping("/{id}/rooms")
    public ApiResponse<List<RoomType>> getRoomTypes(@PathVariable Long id) {
        return ApiResponse.success(homestayService.getRoomTypes(id));
    }

    @Operation(summary = "获取房型日历")
    @GetMapping("/rooms/{roomId}/calendar")
    public ApiResponse<List<RoomCalendar>> getRoomCalendar(
            @PathVariable Long roomId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return ApiResponse.success(homestayService.getRoomCalendar(roomId,
                LocalDate.parse(startDate), LocalDate.parse(endDate)));
    }

    @Operation(summary = "预订房间")
    @PostMapping("/{id}/book")
    public ApiResponse<Order> bookRoom(@PathVariable Long id, @Valid @RequestBody BookRoomRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = homestayService.bookRoom(id, userId, request.getRoomTypeId(),
                LocalDate.parse(request.getCheckIn()), LocalDate.parse(request.getCheckOut()),
                request.getGuestCount(), request.getContactName(), request.getContactPhone());
        return ApiResponse.success(order, "预订成功");
    }
}
