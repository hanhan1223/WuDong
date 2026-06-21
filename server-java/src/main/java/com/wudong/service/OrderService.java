package com.wudong.service;

import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.OrderStatus;
import com.wudong.common.enums.OrderType;
import com.wudong.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

/**
 * 订单服务 - 等价于 Node.js 版本的 OrderService
 */
public interface OrderService {

    /**
     * 创建订单
     */
    Order createOrder(Long userId, OrderType orderType, MerchantModule module, List<OrderItemData> items, String remark);

    /**
     * 获取用户订单列表
     */
    Page<Order> getUserOrders(Long userId, OrderStatus status, OrderType orderType, Pageable pageable);

    /**
     * 获取订单详情
     */
    Order getOrderById(Long orderId);

    /**
     * 取消订单
     */
    void cancelOrder(Long orderId, Long userId, String reason);

    /**
     * 商家确认订单
     */
    void confirmOrder(Long orderId);

    /**
     * 完成订单
     */
    void completeOrder(Long orderId);

    /**
     * 支付成功回调（原子状态转换，防止重复支付）
     */
    void handlePaySuccess(Long orderId, String tradeNo, String payMethod);

    /**
     * 管理员获取所有订单
     */
    Page<Order> getAllOrders(OrderStatus status, OrderType orderType, Pageable pageable);

    /**
     * 订单项数据
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    class OrderItemData {
        private Long productId;
        private String productName;
        private String productImage;
        private Long skuId;
        private String skuName;
        private BigDecimal price;
        private Integer quantity;
    }
}
