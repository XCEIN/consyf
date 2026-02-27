-- ============================================
-- XÓA TOÀN BỘ DỮ LIỆU (giữ nguyên cấu trúc bảng)
-- ⚠️ CẢNH BÁO: Xóa hết data, không thể khôi phục
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notifications;
TRUNCATE TABLE matches;
TRUNCATE TABLE embeddings;
TRUNCATE TABLE job_applications;
TRUNCATE TABLE support_tickets;
TRUNCATE TABLE faq;
TRUNCATE TABLE jobs;
TRUNCATE TABLE promotions;
TRUNCATE TABLE promotion_categories;
TRUNCATE TABLE news_categories;
TRUNCATE TABLE news;
TRUNCATE TABLE posts;
TRUNCATE TABLE companies;
TRUNCATE TABLE email_verifications;
TRUNCATE TABLE password_resets;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Tạo lại tài khoản admin mặc định
-- Password: Admin@123
INSERT INTO users (name, email, phone, password_hash, email_verified, is_active, role, account_type)
VALUES (
  'Admin',
  'admin@consyf.com',
  '0000000000',
  '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkGjPjCbC5FDI0bLMBbQg5xLbVHKG',
  TRUE,
  TRUE,
  'admin',
  'admin'
);

-- Tạo lại danh mục tin tức mẫu
INSERT INTO news_categories (name, slug, description, sort_order) VALUES
('Tin tức', 'tin-tuc', 'Tin tức mới nhất', 1),
('Kiến thức', 'kien-thuc', 'Kiến thức đầu tư, khởi nghiệp', 2),
('Sự kiện', 'su-kien', 'Sự kiện sắp diễn ra', 3),
('Phân tích', 'phan-tich', 'Phân tích thị trường', 4);

SELECT '✅ Đã xóa toàn bộ dữ liệu!' AS result;
SELECT '👤 Admin: admin@consyf.com / Admin@123' AS info;
