-- ============================================
-- RESET & RECREATE DATABASE - consyfnew
-- Chạy file này để xóa sạch và tạo lại toàn bộ DB
-- ⚠️ CẢNH BÁO: Sẽ XÓA TOÀN BỘ DỮ LIỆU
-- ============================================

-- Tắt kiểm tra foreign key để drop không bị lỗi
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa toàn bộ bảng cũ
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS embeddings;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS faq;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS promotion_categories;
DROP TABLE IF EXISTS news_categories;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(512),
  account_type ENUM('personal', 'organization', 'admin', 'editor') DEFAULT 'personal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ============================================
-- 2. EMAIL VERIFICATIONS
-- ============================================
CREATE TABLE email_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_otp (user_id, otp)
);

-- ============================================
-- 3. PASSWORD RESETS
-- ============================================
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- ============================================
-- 4. COMPANIES
-- ============================================
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(512),
  sector VARCHAR(255),
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 5. POSTS (dự án đầu tư / huy động)
-- ============================================
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  type ENUM('buy','sell') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  budget DECIMAL(15,2),
  location VARCHAR(255),
  tags TEXT,
  post_image VARCHAR(512),
  description_images TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_status (status)
);

-- ============================================
-- 6. EMBEDDINGS (vector search)
-- ============================================
CREATE TABLE embeddings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  vector_dim INT NOT NULL,
  vector_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================================
-- 7. MATCHES
-- ============================================
CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buy_post_id INT NOT NULL,
  sell_post_id INT NOT NULL,
  score FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_match (buy_post_id, sell_post_id),
  FOREIGN KEY (buy_post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (sell_post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================================
-- 8. NEWS CATEGORIES
-- ============================================
CREATE TABLE news_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. NEWS (tin tức / blog)
-- ============================================
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  thumbnail VARCHAR(512),
  author_id INT,
  category VARCHAR(100),
  tags TEXT,
  views INT DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  -- SEO fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  canonical_url VARCHAR(512),
  og_image VARCHAR(512),
  -- Content settings
  allow_comments BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_published (published),
  INDEX idx_featured (featured)
);

-- ============================================
-- 10. PROMOTIONS
-- ============================================
CREATE TABLE promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  thumbnail VARCHAR(512),
  category_id INT,
  discount_percent DECIMAL(5,2),
  discount_amount DECIMAL(15,2),
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
);

-- ============================================
-- 11. PROMOTION CATEGORIES
-- ============================================
CREATE TABLE promotion_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 12. JOBS (tuyển dụng)
-- ============================================
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  company_logo VARCHAR(512),
  location VARCHAR(255),
  job_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
  salary_min DECIMAL(15,2),
  salary_max DECIMAL(15,2),
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  deadline TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
);

-- ============================================
-- 13. JOB APPLICATIONS
-- ============================================
CREATE TABLE job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  user_id INT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cv_file VARCHAR(512),
  cover_letter TEXT,
  status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 14. SUPPORT TICKETS
-- ============================================
CREATE TABLE support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 15. FAQ
-- ============================================
CREATE TABLE faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 16. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT,
  type ENUM('post_uploaded', 'post_approved', 'post_rejected') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);

-- ============================================
-- TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH
-- Password: Admin@123 (bcrypt hash)
-- ============================================
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

-- ============================================
-- DỮ LIỆU MẪU NEWS CATEGORIES
-- ============================================
INSERT INTO news_categories (name, slug, description, sort_order) VALUES
('Tin tức', 'tin-tuc', 'Tin tức mới nhất', 1),
('Kiến thức', 'kien-thuc', 'Kiến thức đầu tư, khởi nghiệp', 2),
('Sự kiện', 'su-kien', 'Sự kiện sắp diễn ra', 3),
('Phân tích', 'phan-tich', 'Phân tích thị trường', 4);

SELECT '✅ Database reset thành công!' AS result;
SELECT CONCAT('👤 Admin account: admin@consyf.com / Admin@123') AS info;
