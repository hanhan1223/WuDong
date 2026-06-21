package com.wudong.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateProductRequest {

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "商品标题不能为空")
    private String title;

    private String subtitle;

    @NotBlank(message = "主图不能为空")
    private String mainImage;

    @NotNull(message = "价格不能为空")
    private BigDecimal price;

    private BigDecimal marketPrice;
    private Integer stock;
    private String detail;
    private String craftIntro;
    private List<SkuRequest> skus;

    @Data
    public static class SkuRequest {
        @NotBlank(message = "规格名称不能为空")
        private String specName;

        @NotNull(message = "价格不能为空")
        private BigDecimal price;

        @NotNull(message = "库存不能为空")
        private Integer stock;

        private String image;
    }
}
