-- 乌东文旅平台初始化数据
-- Character set: utf8mb4

-- 1. 管理员角色
INSERT INTO admin_roles (name, permissions, description, created_at) VALUES
('超级管理员', '["*"]', '拥有所有权限', NOW()),
('运营管理员', '["user:read","user:write","order:read","order:write","content:read","content:write","finance:read"]', '运营管理权限', NOW()),
('内容审核员', '["content:read","content:write","report:read","report:write"]', '内容审核权限', NOW());

-- 2. 默认管理员账号 (密码: admin123456, bcrypt hashed)
INSERT INTO admin_users (username, password, name, role_id, status, created_at, updated_at) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, 'ACTIVE', NOW(), NOW());

-- 3. 商品分类
INSERT INTO product_categories (name, icon, parent_id, sort, status, created_at) VALUES
('苗族银饰', NULL, NULL, 1, true, NOW()),
('蜡染制品', NULL, NULL, 2, true, NOW()),
('苗绣工艺品', NULL, NULL, 3, true, NOW()),
('民族服饰', NULL, NULL, 4, true, NOW()),
('特色食品', NULL, NULL, 5, true, NOW());

-- 4. 农产品分类
INSERT INTO farm_categories (name, icon, sort, status, created_at) VALUES
('时令蔬菜', NULL, 1, true, NOW()),
('山野干货', NULL, 2, true, NOW()),
('手工腌制', NULL, 3, true, NOW()),
('蜂蜜花茶', NULL, 4, true, NOW()),
('米酒饮品', NULL, 5, true, NOW());

-- 5. 话题
INSERT INTO topics (name, description, is_top, is_recommend, status, created_at) VALUES
('#乌东苗寨探秘#', '探索乌东苗寨的自然风光与人文历史', true, true, true, NOW()),
('#苗族非遗体验#', '体验苗族银饰、蜡染、苗绣等非物质文化遗产', false, true, true, NOW()),
('#乌东美食打卡#', '分享乌东特色美食与农家菜', false, true, true, NOW()),
('#梯田风光#', '记录乌东梯田的四季美景', false, false, true, NOW()),
('#苗族节庆#', '记录苗年、吃新节等传统节庆活动', false, false, true, NOW());

-- 6. 系统配置
INSERT INTO system_configs (`key`, value, remark, updated_at) VALUES
('site_name', '乌东文旅', '网站名称', NOW()),
('site_description', '乌东文旅衣食住行综合服务平台', '网站描述', NOW()),
('commission_rate_physical', '0.05', '实物商品佣金比例', NOW()),
('commission_rate_service', '0.1', '服务类佣金比例', NOW()),
('settlement_cycle_days', '7', '结算周期（天）', NOW()),
('order_auto_complete_days', '7', '订单自动完成天数', NOW()),
('max_upload_size_mb', '5', '最大上传文件大小（MB）', NOW()),
('sensitive_word_mute_threshold', '3', '敏感词命中禁言阈值', NOW()),
('mute_duration_hours', '24', '禁言时长（小时）', NOW());

-- 7. 轮播图
INSERT INTO banners (title, image_url, link_url, module, sort, status, created_at) VALUES
('探秘乌东苗寨', '/images/banner1.jpg', '/travel', 'home', 1, true, NOW()),
('非遗苗族银饰', '/images/banner2.jpg', '/clothing', 'home', 2, true, NOW()),
('苗乡长桌宴', '/images/banner3.jpg', '/dining', 'home', 3, true, NOW()),
('吊脚楼民宿', '/images/banner4.jpg', '/homestay', 'home', 4, true, NOW());

-- 8. 敏感词（示例）
INSERT INTO sensitive_words (word, level, status, created_at) VALUES
('赌博', 3, true, NOW()),
('色情', 3, true, NOW()),
('毒品', 3, true, NOW()),
('暴力', 2, true, NOW()),
('诈骗', 3, true, NOW());
