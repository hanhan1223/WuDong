package com.wudong.service.impl;

import com.wudong.common.enums.OrderStatus;
import com.wudong.common.enums.PaymentStatus;
import com.wudong.common.enums.RefundStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.Order;
import com.wudong.entity.Payment;
import com.wudong.entity.Refund;
import com.wudong.repository.OrderRepository;
import com.wudong.repository.PaymentRepository;
import com.wudong.repository.RefundRepository;
import com.wudong.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 支付服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;

    /**
     * 创建预支付
     */
    @Transactional
    public Payment createPayment(Long orderId, String method) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在", 404));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("订单状态不允许支付");
        }

        // 检查是否已有支付记录
        Payment existingPayment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.PENDING) {
            return existingPayment;
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getPayAmount());
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    /**
     * 支付成功回调
     */
    @Transactional
    public void handlePaySuccess(Long orderId, String tradeNo, String method) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("支付记录不存在", 404));

        payment.setTradeNo(tradeNo);
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 更新订单状态
        Order order = payment.getOrder();
        order.setStatus(OrderStatus.PAID);
        order.setPayMethod(method);
        order.setPayTime(LocalDateTime.now());
        order.setTradeNo(tradeNo);
        orderRepository.save(order);
    }

    /**
     * 申请退款
     */
    @Transactional
    public void applyRefund(Long orderId, java.math.BigDecimal amount, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在", 404));

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BusinessException("订单状态不允许退款");
        }

        // 确定退款金额：指定金额则部分退款，否则全额退款
        java.math.BigDecimal refundAmount = (amount != null && amount.compareTo(java.math.BigDecimal.ZERO) > 0)
                ? amount : order.getPayAmount();
        if (refundAmount.compareTo(order.getPayAmount()) > 0) {
            throw new BusinessException("退款金额不能超过订单金额");
        }

        // 创建退款记录
        Refund refund = new Refund();
        refund.setOrder(order);
        refund.setAmount(refundAmount);
        refund.setReason(reason);
        refund.setStatus(RefundStatus.PENDING);
        refund.setCreatedAt(LocalDateTime.now());
        refundRepository.save(refund);

        // 更新订单状态
        order.setStatus(OrderStatus.REFUNDING);
        orderRepository.save(order);
    }

    /**
     * 退款成功回调（完成退款流程）
     */
    @Transactional
    public void handleRefundSuccess(Long orderId) {
        Refund refund = refundRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("退款记录不存在", 404));

        // 更新退款状态
        refund.setStatus(RefundStatus.COMPLETED);
        refund.setRefundedAt(LocalDateTime.now());
        refundRepository.save(refund);

        // 更新支付状态
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException("支付记录不存在", 404));
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        // 更新订单状态
        Order order = refund.getOrder();
        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);
    }

    /**
     * 查询支付状态
     */
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).orElse(null);
    }
}
