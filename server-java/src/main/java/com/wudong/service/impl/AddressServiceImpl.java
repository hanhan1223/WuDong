package com.wudong.service.impl;

import com.wudong.common.exception.BusinessException;
import com.wudong.entity.Address;
import com.wudong.entity.User;
import com.wudong.repository.AddressRepository;
import com.wudong.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 地址服务实现 - 等价于 Node.js 版本的 AddressService
 */
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    /**
     * 获取用户地址列表
     */
    @Override
    @Transactional(readOnly = true)
    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultedDescCreatedAtDesc(userId);
    }

    /**
     * 创建地址
     */
    @Override
    @Transactional
    public Address createAddress(Long userId, String name, String phone, String province, String city,
                                  String district, String detail, Boolean isDefault) {
        Address address = new Address();
        address.setUser(new User());
        address.getUser().setId(userId);
        address.setName(name);
        address.setPhone(phone);
        address.setProvince(province);
        address.setCity(city);
        address.setDistrict(district);
        address.setDetail(detail);

        // 第一个地址自动设为默认
        long count = addressRepository.countByUserId(userId);
        if (count == 0) {
            address.setDefaulted(true);
        } else {
            address.setDefaulted(isDefault != null ? isDefault : false);
        }

        // 如果设为默认，取消其他默认地址
        if (address.getDefaulted()) {
            clearDefaultAddress(userId);
        }

        return addressRepository.save(address);
    }

    /**
     * 更新地址
     */
    @Override
    @Transactional
    public Address updateAddress(Long addressId, Long userId, String name, String phone, String province,
                                  String city, String district, String detail, Boolean isDefault) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException("地址不存在", 404));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此地址", 403);
        }

        if (name != null) address.setName(name);
        if (phone != null) address.setPhone(phone);
        if (province != null) address.setProvince(province);
        if (city != null) address.setCity(city);
        if (district != null) address.setDistrict(district);
        if (detail != null) address.setDetail(detail);

        if (isDefault != null && isDefault) {
            clearDefaultAddress(userId);
            address.setDefaulted(true);
        }

        return addressRepository.save(address);
    }

    /**
     * 删除地址
     */
    @Override
    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException("地址不存在", 404));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此地址", 403);
        }

        boolean wasDefault = address.getDefaulted();
        addressRepository.delete(address);

        // 如果删除的是默认地址，自动将最新地址设为默认
        if (wasDefault) {
            List<Address> addresses = addressRepository.findByUserIdOrderByDefaultedDescCreatedAtDesc(userId);
            if (!addresses.isEmpty()) {
                Address newDefault = addresses.get(0);
                newDefault.setDefaulted(true);
                addressRepository.save(newDefault);
            }
        }
    }

    /**
     * 设置默认地址
     */
    @Override
    @Transactional
    public void setDefaultAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException("地址不存在", 404));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException("无权操作此地址", 403);
        }

        clearDefaultAddress(userId);
        address.setDefaulted(true);
        addressRepository.save(address);
    }

    /**
     * 清除用户的默认地址
     */
    private void clearDefaultAddress(Long userId) {
        Address defaultAddress = addressRepository.findByUserIdAndDefaulted(userId, true).orElse(null);
        if (defaultAddress != null) {
            defaultAddress.setDefaulted(false);
            addressRepository.save(defaultAddress);
        }
    }
}
