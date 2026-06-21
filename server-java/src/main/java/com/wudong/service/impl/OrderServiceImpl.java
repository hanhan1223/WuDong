package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.enums.*;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.OrderService;
import com.wudong.service.OrderService.OrderItemData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 订单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    /**
     * 生成订单号: WD + 时间戳 + 6位随机字符
     */
    private String generateOrderNo() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return BusinessConstants.ORDER_NO_PREFIX + timestamp + random;
    }

    @Override
    @Transactional
    public Order createOrder(Long userId, OrderType orderType, MerchantModule module, List<OrderItemData> items, String remark) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException("订单商品不能为空");
        }

        // 计算总金额（使用整数分，避免浮点精度问题）
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemData item : items) {
            totalAmount = totalAmount.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUser(new User());
        order.getUser().setId(userId);
        order.setOrderType(orderType);
        order.setModule(module);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setTotalAmount(totalAmount);
        order.setPayAmount(totalAmount);
        order.setRemark(remark);

        order = orderRepository.save(order);

        // 创建订单项
        for (OrderItemData item : items) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName());
            orderItem.setProductImage(item.getProductImage());
            orderItem.setSkuId(item.getSkuId());
            orderItem.setSkuName(item.getSkuName());
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            orderItemRepository.save(orderItem);
        }

        return order;
    }

    @Override
    public Page<Order> getUserOrders(Long userId, OrderStatus status, OrderType orderType, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        }
        if (orderType != null) {
            return orderRepository.findByUserIdAndOrderTypeOrderByCreatedAtDesc(userId, orderType, pageable);
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在", 404));
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, Long userId, String reason) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此订单", 403);
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("只有待支付的订单可以取消");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        order.setCancelTime(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.PAID) {
            throw new BusinessException("只有已支付的订单可以确认");
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void completeOrder(Long orderId) {
        Order order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new BusinessException("订单状态不允许完成操作");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void handlePaySuccess(Long orderId, String tradeNo, String payMethod) {
        Order order = getOrderById(orderId);

        // 只有待支付状态才能变为已支付（防止重复支付）
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            log.warn("订单 {} 状态不是待支付，当前状态: {}，跳过支付回调", orderId, order.getStatus());
            return;
        }

        order.setStatus(OrderStatus.PAID);
        order.setPayMethod(payMethod);
        order.setPayTime(LocalDateTime.now());
        order.setTradeNo(tradeNo);
        orderRepository.save(order);

        // 创建支付记录
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getPayAmount());
        payment.setMethod(payMethod);
        payment.setTradeNo(tradeNo);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }

    @Override
    public Page<Order> getAllOrders(OrderStatus status, OrderType orderType, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatus(status, pageable);
        }
        if (orderType != null) {
            return orderRepository.findByOrderType(orderType, pageable);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
