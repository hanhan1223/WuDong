package com.wudong.service;

import com.wudong.entity.Payment;

/**
 * 支付服务 - 等价于 Node.js 版本的 PaymentService
 */
public interface PaymentService {

    /**
     * 创建预支付
     */
    Payment createPayment(Long orderId, String method);

    /**
     * 支付成功回调
     */
    void handlePaySuccess(Long orderId, String tradeNo, String method);

    /**
     * 申请退款（支持部分退款，amount为null时全额退款）
     */
    void applyRefund(Long orderId, java.math.BigDecimal amount, String reason);

    /**
     * 退款成功回调（完成退款流程）
     */
    void handleRefundSuccess(Long orderId);

    /**
     * 查询支付状态
     */
    Payment getPaymentByOrderId(Long orderId);
}
