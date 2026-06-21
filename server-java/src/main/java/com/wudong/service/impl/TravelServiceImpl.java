package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.enums.*;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.TravelService;
import com.wudong.service.OrderService;
import com.wudong.service.CacheService;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 旅游服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TravelServiceImpl implements TravelService {

    private final ScenicSpotRepository scenicSpotRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TravelRouteRepository travelRouteRepository;
    private final RouteItineraryRepository routeItineraryRepository;
    private final TransportGuideRepository transportGuideRepository;
    private final ETicketRepository eTicketRepository;
    private final OrderService orderService;
    private final CacheService cacheService;

    /**
     * 获取景点列表
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ScenicSpot> getScenicSpots(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return scenicSpotRepository.searchByKeyword(keyword, pageable);
        }
        return scenicSpotRepository.findByStatusTrue(pageable);
    }

    /**
     * 获取景点详情
     */
    @Override
    @Transactional(readOnly = true)
    public ScenicSpot getScenicSpotById(Long id) {
        String cacheKey = BusinessConstants.CACHE_PREFIX_SCENIC_SPOT + id;
        ScenicSpot spot = cacheService.get(cacheKey);
        if (spot != null) {
            return spot;
        }

        spot = scenicSpotRepository.findById(id)
                .orElseThrow(() -> new BusinessException("景点不存在", 404));

        spot.setTicketTypes(ticketTypeRepository.findBySpotIdAndStatusTrue(id));

        cacheService.set(cacheKey, spot, BusinessConstants.CACHE_TTL_SHORT);
        return spot;
    }

    /**
     * 获取票种列表
     */
    @Override
    @Transactional(readOnly = true)
    public List<TicketType> getTicketTypes(Long spotId) {
        return ticketTypeRepository.findBySpotIdAndStatusTrue(spotId);
    }

    /**
     * 获取路线列表
     */
    @Override
    @Transactional(readOnly = true)
    public Page<TravelRoute> getRoutes(String keyword, String theme, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return travelRouteRepository.searchByKeyword(keyword, pageable);
        }
        if (theme != null && !theme.isEmpty()) {
            return travelRouteRepository.findByTheme(theme, pageable);
        }
        return travelRouteRepository.findByStatusTrue(pageable);
    }

    /**
     * 获取路线详情
     */
    @Override
    @Transactional(readOnly = true)
    public TravelRoute getRouteById(Long id) {
        String cacheKey = BusinessConstants.CACHE_PREFIX_ROUTE + id;
        TravelRoute route = cacheService.get(cacheKey);
        if (route != null) {
            return route;
        }

        route = travelRouteRepository.findById(id)
                .orElseThrow(() -> new BusinessException("路线不存在", 404));

        route.setItineraries(routeItineraryRepository.findByRouteIdOrderByDayAsc(id));

        cacheService.set(cacheKey, route, BusinessConstants.CACHE_TTL_SHORT);
        return route;
    }

    /**
     * 获取交通指南
     */
    @Override
    @Transactional(readOnly = true)
    public List<TransportGuide> getTransportGuides() {
        return transportGuideRepository.findByStatusTrueOrderBySortAsc();
    }

    /**
     * 根据电子票码查询
     */
    @Override
    @Transactional(readOnly = true)
    public ETicket getETicketByCode(String code) {
        return eTicketRepository.findByTicketCode(code)
                .orElseThrow(() -> new BusinessException("电子票不存在", 404));
    }

    /**
     * 购买门票 - 使用原子库存扣减
     */
    @Override
    @Transactional
    public Order buyTickets(Long userId, Long ticketTypeId, Integer quantity, LocalDate validDate,
                             String contactName, String contactPhone) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new BusinessException("票种不存在", 404));

        // 原子扣减库存，WHERE 条件保证库存充足
        int updated = ticketTypeRepository.decrementStock(ticketTypeId, quantity);
        if (updated == 0) {
            throw new BusinessException("库存不足");
        }

        // 重新加载扣减后的库存值
        ticketType = ticketTypeRepository.findById(ticketTypeId).orElseThrow();

        // 创建门票订单
        BigDecimal totalAmount = ticketType.getPrice().multiply(BigDecimal.valueOf(quantity));
        List<OrderService.OrderItemData> items = new ArrayList<>();
        items.add(new OrderService.OrderItemData(
                ticketType.getSpot().getId(),
                ticketType.getSpot().getName() + " - " + ticketType.getName(),
                ticketType.getSpot().getMainImage(),
                ticketTypeId,
                ticketType.getName(),
                ticketType.getPrice(),
                quantity
        ));

        Order order = orderService.createOrder(userId, OrderType.TICKET, MerchantModule.TRAVEL, items,
                "有效期: " + validDate + ", 联系人: " + contactName + " " + contactPhone);

        // 生成电子票
        for (int i = 0; i < quantity; i++) {
            ETicket eTicket = new ETicket();
            eTicket.setOrderId(order.getId());
            eTicket.setTicketCode(generateTicketCode());
            eTicket.setTargetId(ticketTypeId);
            eTicket.setTargetType("ticket");
            eTicket.setValidDate(validDate);
            eTicket.setStatus(ETicketStatus.UNUSED);
            eTicketRepository.save(eTicket);
        }

        return order;
    }

    /**
     * 生成电子票码
     */
    private String generateTicketCode() {
        return "ET" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
