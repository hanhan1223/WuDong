package com.wudong.dto.product;

import com.wudong.common.enums.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProductRequest {
    private Long categoryId;
    private String title;
    private String subtitle;
    private String mainImage;
    private BigDecimal price;
    private BigDecimal marketPrice;
    private Integer stock;
    private String detail;
    private String craftIntro;
    private ProductStatus status;
}
