package com.wudong.service;

import com.wudong.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * 民宿服务 - 等价于 Node.js 版本的 HomestayService
 */
public interface HomestayService {

    /**
     * 获取民宿列表
     */
    Page<Homestay> getHomestays(String keyword, Pageable pageable);

    /**
     * 获取民宿详情
     */
    Homestay getHomestayById(Long id);

    /**
     * 获取房型列表
     */
    List<RoomType> getRoomTypes(Long homestayId);

    /**
     * 获取房型日历（可用性）
     */
    List<RoomCalendar> getRoomCalendar(Long roomTypeId, LocalDate startDate, LocalDate endDate);

    /**
     * 预订房间 - 使用原子库存扣减防止超卖
     */
    Order bookRoom(Long homestayId, Long userId, Long roomTypeId, LocalDate checkIn,
                   LocalDate checkOut, Integer guestCount, String contactName, String contactPhone);
}
