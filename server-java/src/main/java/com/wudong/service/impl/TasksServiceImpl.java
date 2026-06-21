package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.enums.*;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.TasksService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 定时任务服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TasksServiceImpl implements TasksService {

    private final OrderRepository orderRepository;
    private final ETicketRepository eTicketRepository;
    private final FinanceRecordRepository financeRecordRepository;
    private final UserRepository userRepository;

    /**
     * 自动完成已确认超过7天的订单 - 每24小时执行
     */
    @Override
    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    @Transactional
    public void autoCompleteOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(BusinessConstants.SETTLEMENT_CYCLE_DAYS);
        List<Order> orders = orderRepository.findConfirmedOrdersBefore(threshold);

        for (Order order : orders) {
            order.setStatus(OrderStatus.COMPLETED);
            order.setCompletedAt(LocalDateTime.now());
            orderRepository.save(order);
            log.info("自动完成订单: {}", order.getOrderNo());
        }

        if (!orders.isEmpty()) {
            log.info("自动完成 {} 个订单", orders.size());
        }
    }

    /**
     * 过期未使用的电子票 - 每24小时执行
     */
    @Override
    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    @Transactional
    public void expireETickets() {
        List<ETicket> tickets = eTicketRepository.findExpiredTickets(LocalDate.now());

        for (ETicket ticket : tickets) {
            ticket.setStatus(ETicketStatus.EXPIRED);
            eTicketRepository.save(ticket);
            log.info("过期电子票: {}", ticket.getTicketCode());
        }

        if (!tickets.isEmpty()) {
            log.info("过期 {} 张电子票", tickets.size());
        }
    }

    /**
     * 自动结算T+7财务记录 - 每24小时执行
     */
    @Override
    @Scheduled(fixedRate = 24 * 60 * 60 * 1000)
    @Transactional
    public void autoSettleFinance() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(BusinessConstants.SETTLEMENT_CYCLE_DAYS);
        List<FinanceRecord> records = financeRecordRepository.findPendingBefore(threshold);

        for (FinanceRecord record : records) {
            record.setStatus(FinanceStatus.SETTLED);
            record.setSettledAt(LocalDateTime.now());
            financeRecordRepository.save(record);
            log.info("自动结算财务记录: {}", record.getId());
        }

        if (!records.isEmpty()) {
            log.info("自动结算 {} 条财务记录", records.size());
        }
    }

    /**
     * 自动解禁禁言超过24小时的用户 - 每1小时执行
     */
    @Override
    @Scheduled(fixedRate = 60 * 60 * 1000)
    @Transactional
    public void unmuteUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(BusinessConstants.AUTO_MUTE_HOURS);
        List<User> users = userRepository.findMutedUsersBefore(threshold);

        for (User user : users) {
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
            log.info("自动解禁用户: {}", user.getId());
        }

        if (!users.isEmpty()) {
            log.info("自动解禁 {} 个用户", users.size());
        }
    }
}
