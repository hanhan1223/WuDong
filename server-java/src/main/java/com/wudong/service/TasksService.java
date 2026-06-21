package com.wudong.service;

/**
 * 定时任务服务 - 等价于 Node.js 版本的 TasksService
 */
public interface TasksService {

    /**
     * 自动完成已确认超过7天的订单 - 每24小时执行
     */
    void autoCompleteOrders();

    /**
     * 过期未使用的电子票 - 每24小时执行
     */
    void expireETickets();

    /**
     * 自动结算T+7财务记录 - 每24小时执行
     */
    void autoSettleFinance();

    /**
     * 自动解禁禁言超过24小时的用户 - 每1小时执行
     */
    void unmuteUsers();
}
