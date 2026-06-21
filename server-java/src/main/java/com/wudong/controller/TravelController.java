package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.travel.BuyTicketRequest;
import com.wudong.entity.*;
import com.wudong.security.SecurityUtils;
import com.wudong.service.TravelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "旅游")
@RestController
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;

    @Operation(summary = "获取景点列表")
    @GetMapping("/api/scenic-spots")
    public ApiResponse<Page<ScenicSpot>> getScenicSpots(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(travelService.getScenicSpots(keyword, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取景点详情")
    @GetMapping("/api/scenic-spots/{id}")
    public ApiResponse<ScenicSpot> getScenicSpot(@PathVariable Long id) {
        return ApiResponse.success(travelService.getScenicSpotById(id));
    }

    @Operation(summary = "获取票种列表")
    @GetMapping("/api/scenic-spots/{id}/tickets")
    public ApiResponse<List<TicketType>> getTicketTypes(@PathVariable Long id) {
        return ApiResponse.success(travelService.getTicketTypes(id));
    }

    @Operation(summary = "获取路线列表")
    @GetMapping("/api/routes")
    public ApiResponse<Page<TravelRoute>> getRoutes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String theme,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(travelService.getRoutes(keyword, theme, PageRequest.of(page - 1, pageSize)));
    }

    @Operation(summary = "获取路线详情")
    @GetMapping("/api/routes/{id}")
    public ApiResponse<TravelRoute> getRoute(@PathVariable Long id) {
        return ApiResponse.success(travelService.getRouteById(id));
    }

    @Operation(summary = "获取交通指南")
    @GetMapping("/api/transport-guides")
    public ApiResponse<List<TransportGuide>> getTransportGuides() {
        return ApiResponse.success(travelService.getTransportGuides());
    }

    @Operation(summary = "查询电子票")
    @GetMapping("/api/e-tickets/{code}")
    public ApiResponse<ETicket> getETicket(@PathVariable String code) {
        return ApiResponse.success(travelService.getETicketByCode(code));
    }

    @Operation(summary = "购买门票")
    @PostMapping("/api/tickets/buy")
    public ApiResponse<Order> buyTickets(@Valid @RequestBody BuyTicketRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Order order = travelService.buyTickets(userId, request.getTicketTypeId(), request.getQuantity(),
                LocalDate.parse(request.getValidDate()), request.getContactName(), request.getContactPhone());
        return ApiResponse.success(order, "购票成功");
    }
}
