package com.wudong.common.constants;

/**
 * 业务常量 - 与 Node.js 版本的 constants/index.ts 一致
 */
public final class BusinessConstants {

    private BusinessConstants() {
        throw new UnsupportedOperationException("常量类不允许实例化");
    }

    /** 佣金率 - 实物商品 */
    public static final double COMMISSION_RATE_PHYSICAL = 0.05;

    /** 佣金率 - 服务 */
    public static final double COMMISSION_RATE_SERVICE = 0.10;

    /** 结算周期（天） */
    public static final int SETTLEMENT_CYCLE_DAYS = 7;

    /** 分页默认值 */
    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    /** 文件限制 */
    public static final long IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
    public static final long VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB
    public static final int VIDEO_MAX_DURATION = 60; // 60秒
    public static final int MAX_IMAGES_PER_POST = 9;

    /** 订单号前缀 */
    public static final String ORDER_NO_PREFIX = "WD";

    /** JWT 相关 */
    public static final String JWT_USER_ID_KEY = "userId";
    public static final String JWT_ROLE_KEY = "role";
    public static final String JWT_PHONE_KEY = "phone";

    /** Redis 缓存前缀 */
    public static final String CACHE_PREFIX_USER = "user:";
    public static final String CACHE_PREFIX_PRODUCT = "product:";
    public static final String CACHE_PREFIX_CATEGORY = "category:";
    public static final String CACHE_PREFIX_HOT_PRODUCTS = "hot_products";
    public static final String CACHE_PREFIX_RESTAURANT = "restaurant:";
    public static final String CACHE_PREFIX_HOMESTAY = "homestay:";
    public static final String CACHE_PREFIX_ROOM_CALENDAR = "room_calendar:";
    public static final String CACHE_PREFIX_SCENIC_SPOT = "scenic_spot:";
    public static final String CACHE_PREFIX_ROUTE = "route:";
    public static final String CACHE_PREFIX_POST = "post:";
    public static final String CACHE_PREFIX_SMS = "sms:";
    public static final String CACHE_PREFIX_RATE_LIMIT = "rate_limit:";
    public static final String CACHE_PREFIX_LOCK = "lock:";

    /** 缓存 TTL（秒） */
    public static final int CACHE_TTL_SHORT = 300; // 5分钟
    public static final int CACHE_TTL_MEDIUM = 1800; // 30分钟
    public static final int CACHE_TTL_LONG = 3600; // 1小时
    public static final int CACHE_TTL_DAY = 86400; // 24小时
    public static final int CACHE_TTL_SMS = 300; // 5分钟

    /** 限流配置 */
    public static final int RATE_LIMIT_DEFAULT = 60; // 60次/分钟
    public static final int RATE_LIMIT_LOGIN = 10; // 10次/分钟
    public static final int RATE_LIMIT_REGISTER = 5; // 5次/分钟
    public static final int RATE_LIMIT_WINDOW = 60; // 60秒窗口

    /** 内容审核 */
    public static final int AUTO_MUTE_THRESHOLD = 3; // 3个敏感词触发自动禁言
    public static final int AUTO_MUTE_HOURS = 24; // 禁言24小时
}
