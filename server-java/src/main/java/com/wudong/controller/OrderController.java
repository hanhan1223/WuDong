package com.wudong.controller;

import com.wudong.common.enums.OrderStatus;
import com.wudong.common.enums.OrderType;
import com.wudong.common.response.ApiResponse;
import com.wudong.dto.order.CancelOrderRequest;
import com.wudong.dto.order.CreateOrderRequest;
import com.wudong.entity.Order;
import com.wudong.security.SecurityUtils;
import com.wudong.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "订单")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "创建订单")
    @PostMapping("/create")
    public ApiResponse<Order> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        List<OrderService.OrderItemData> items = request.getItems().stream()
                .map(item -> new OrderService.OrderItemData(item.getProductId(), item.getProductName(),
                        item.getProductImage(), item.getSkuId(), item.getSkuName(), item.getPrice(), item.getQuantity()))
                .collect(Collectors.toList());

        Order order = orderService.createOrder(userId, request.getOrderType(), request.getModule(), items, request.getRemark());
        return ApiResponse.success(order, "订单创建成功");
    }

    @Operation(summary = "获取用户订单列表")
    @GetMapping("/list")
    public ApiResponse<Page<Order>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderType orderType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtils.getCurrentUserId();
        Page<Order> orders = orderService.getUserOrders(userId, status, orderType, PageRequest.of(page - 1, pageSize));
        return ApiResponse.success(orders);
    }

    @Operation(summary = "获取订单详情")
    @GetMapping("/{id}")
    public ApiResponse<Order> getOrder(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ApiResponse.success(order);
    }

    @Operation(summary = "取消订单")
    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancelOrder(@PathVariable Long id, @RequestBody CancelOrderRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        orderService.cancelOrder(id, userId, request.getReason());
        return ApiResponse.success(null, "订单已取消");
    }

    @Operation(summary = "确认订单（商家）")
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyAuthority('ROLE_MERCHANT', 'ROLE_ADMIN')")
    public ApiResponse<Void> confirmOrder(@PathVariable Long id) {
        orderService.confirmOrder(id);
        return ApiResponse.success(null, "订单已确认");
    }

    @Operation(summary = "完成订单")
    @PostMapping("/{id}/complete")
    public ApiResponse<Void> completeOrder(@PathVariable Long id) {
        orderService.completeOrder(id);
        return ApiResponse.success(null, "订单已完成");
    }
}
