package com.wudong.service.impl;

import com.wudong.common.constants.BusinessConstants;
import com.wudong.common.enums.HomestayStatus;
import com.wudong.common.enums.MerchantModule;
import com.wudong.common.enums.OrderStatus;
import com.wudong.common.enums.OrderType;
import com.wudong.common.enums.RoomCalendarStatus;
import com.wudong.common.exception.BusinessException;
import com.wudong.entity.*;
import com.wudong.repository.*;
import com.wudong.service.HomestayService;
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

/**
 * 民宿服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HomestayServiceImpl implements HomestayService {

    private final HomestayRepository homestayRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomCalendarRepository roomCalendarRepository;
    private final CheckinRuleRepository checkinRuleRepository;
    private final OrderService orderService;
    private final CacheService cacheService;

    /**
     * 获取民宿列表
     */
    @Override
    public Page<Homestay> getHomestays(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return homestayRepository.searchByKeyword(keyword, pageable);
        }
        return homestayRepository.findByStatus(HomestayStatus.ACTIVE, pageable);
    }

    /**
     * 获取民宿详情
     */
    @Override
    public Homestay getHomestayById(Long id) {
        String cacheKey = BusinessConstants.CACHE_PREFIX_HOMESTAY + id;
        Homestay homestay = cacheService.get(cacheKey);
        if (homestay != null) {
            return homestay;
        }

        homestay = homestayRepository.findById(id)
                .orElseThrow(() -> new BusinessException("民宿不存在", 404));

        // 加载房型和入住规则
        homestay.setRoomTypes(roomTypeRepository.findByHomestayIdAndStatus(id, true));
        homestay.setCheckinRule(checkinRuleRepository.findByHomestayId(id).orElse(null));

        cacheService.set(cacheKey, homestay, BusinessConstants.CACHE_TTL_SHORT);
        return homestay;
    }

    /**
     * 获取房型列表
     */
    @Override
    public List<RoomType> getRoomTypes(Long homestayId) {
        return roomTypeRepository.findByHomestayIdAndStatus(homestayId, true);
    }

    /**
     * 获取房型日历（可用性）
     */
    @Override
    public List<RoomCalendar> getRoomCalendar(Long roomTypeId, LocalDate startDate, LocalDate endDate) {
        String cacheKey = BusinessConstants.CACHE_PREFIX_ROOM_CALENDAR + roomTypeId + ":" + startDate + ":" + endDate;
        List<RoomCalendar> calendar = cacheService.get(cacheKey);
        if (calendar != null) {
            return calendar;
        }

        calendar = roomCalendarRepository.findByRoomTypeIdAndDateBetween(roomTypeId, startDate, endDate);
        cacheService.set(cacheKey, calendar, BusinessConstants.CACHE_TTL_SHORT);
        return calendar;
    }

    /**
     * 预订房间 - 使用原子库存扣减防止超卖
     */
    @Override
    @Transactional
    public Order bookRoom(Long homestayId, Long userId, Long roomTypeId, LocalDate checkIn,
                           LocalDate checkOut, Integer guestCount, String contactName, String contactPhone) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new BusinessException("房型不存在", 404));

        if (!roomType.getHomestay().getId().equals(homestayId)) {
            throw new BusinessException("房型不属于该民宿");
        }

        // 遍历日期范围，原子扣减库存
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = checkIn;
        while (current.isBefore(checkOut)) {
            dates.add(current);
            current = current.plusDays(1);
        }

        for (LocalDate date : dates) {
            int updated = roomCalendarRepository.decrementAvailable(roomTypeId, date);
            if (updated == 0) {
                throw new BusinessException("房间在 " + date + " 已满，无法预订");
            }
        }

        // 创建住宿订单
        BigDecimal totalAmount = roomType.getPrice().multiply(BigDecimal.valueOf(dates.size()));
        List<OrderService.OrderItemData> items = new ArrayList<>();
        items.add(new OrderService.OrderItemData(
                roomType.getHomestay().getId(),
                roomType.getHomestay().getName() + " - " + roomType.getName(),
                roomType.getMainImage(),
                roomTypeId,
                roomType.getName(),
                roomType.getPrice(),
                dates.size()
        ));

        Order order = orderService.createOrder(userId, OrderType.ACCOMMODATION, MerchantModule.ACCOMMODATION, items,
                "入住: " + checkIn + ", 退房: " + checkOut + ", 联系人: " + contactName + " " + contactPhone);

        return order;
    }
}
