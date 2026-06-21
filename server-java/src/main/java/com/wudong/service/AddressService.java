package com.wudong.service;

import com.wudong.entity.Address;

import java.util.List;

/**
 * 地址服务 - 等价于 Node.js 版本的 AddressService
 */
public interface AddressService {

    /**
     * 获取用户地址列表
     */
    List<Address> getAddresses(Long userId);

    /**
     * 创建地址
     */
    Address createAddress(Long userId, String name, String phone, String province, String city,
                          String district, String detail, Boolean isDefault);

    /**
     * 更新地址
     */
    Address updateAddress(Long addressId, Long userId, String name, String phone, String province,
                          String city, String district, String detail, Boolean isDefault);

    /**
     * 删除地址
     */
    void deleteAddress(Long addressId, Long userId);

    /**
     * 设置默认地址
     */
    void setDefaultAddress(Long addressId, Long userId);
}
