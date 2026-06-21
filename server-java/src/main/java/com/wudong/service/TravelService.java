package com.wudong.service;

import com.wudong.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * 旅游服务 - 等价于 Node.js 版本的 TravelService
 */
public interface TravelService {

    /**
     * 获取景点列表
     */
    Page<ScenicSpot> getScenicSpots(String keyword, Pageable pageable);

    /**
     * 获取景点详情
     */
    ScenicSpot getScenicSpotById(Long id);

    /**
     * 获取票种列表
     */
    List<TicketType> getTicketTypes(Long spotId);

    /**
     * 获取路线列表
     */
    Page<TravelRoute> getRoutes(String keyword, String theme, Pageable pageable);

    /**
     * 获取路线详情
     */
    TravelRoute getRouteById(Long id);

    /**
     * 获取交通指南
     */
    List<TransportGuide> getTransportGuides();

    /**
     * 根据电子票码查询
     */
    ETicket getETicketByCode(String code);

    /**
     * 购买门票 - 使用原子库存扣减
     */
    Order buyTickets(Long userId, Long ticketTypeId, Integer quantity, LocalDate validDate,
                     String contactName, String contactPhone);
}
