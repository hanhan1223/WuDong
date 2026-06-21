package com.wudong.controller;

import com.wudong.common.response.ApiResponse;
import com.wudong.dto.payment.ApplyRefundRequest;
import com.wudong.dto.payment.CreatePaymentRequest;
import com.wudong.entity.Payment;
import com.wudong.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "支付")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "创建预支付")
    @PostMapping("/create")
    public ApiResponse<Payment> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        Payment payment = paymentService.createPayment(request.getOrderId(), request.getMethod());
        return ApiResponse.success(payment);
    }

    @Operation(summary = "支付成功回调")
    @PostMapping("/callback")
    public ApiResponse<Void> payCallback(@RequestBody Map<String, String> body) {
        paymentService.handlePaySuccess(
                Long.valueOf(body.get("orderId")),
                body.get("tradeNo"),
                body.get("method"));
        return ApiResponse.success(null, "支付成功");
    }

    @Operation(summary = "申请退款")
    @PostMapping("/refund")
    public ApiResponse<Void> applyRefund(@Valid @RequestBody ApplyRefundRequest request) {
        paymentService.applyRefund(request.getOrderId(), request.getAmount(), request.getReason());
        return ApiResponse.success(null, "退款申请已提交");
    }

    @Operation(summary = "查询支付状态")
    @GetMapping("/{orderId}")
    public ApiResponse<Payment> getPayment(@PathVariable Long orderId) {
        return ApiResponse.success(paymentService.getPaymentByOrderId(orderId));
    }
}
