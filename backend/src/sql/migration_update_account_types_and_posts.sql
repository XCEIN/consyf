-- Migration: Update account types and add post images
-- Date: 2025-12-01

-- 1. Update existing account_type values
UPDATE users 
SET account_type = CASE
    WHEN account_type IN ('personal', 'personal_project') THEN 'personal'
    WHEN account_type IN ('investor', 'investment_fund', 'partner', 'company') THEN 'organization'
    ELSE 'personal'
END
WHERE account_type IS NOT NULL;

-- 2. Change account_type to ENUM with only 2 options
ALTER TABLE users 
MODIFY COLUMN account_type ENUM('personal', 'organization') DEFAULT 'personal';

-- 3. Add image columns to posts table
ALTER TABLE posts 
ADD COLUMN post_image VARCHAR(512) NULL COMMENT 'Ảnh đại diện dự án (bắt buộc với tổ chức)' AFTER tags,
ADD COLUMN description_images TEXT NULL COMMENT 'JSON array các ảnh mô tả dự án' AFTER post_image;

-- 4. Add index for account_type
ALTER TABLE users ADD INDEX idx_account_type (account_type);

-- Verify changes
SELECT 'Migration completed successfully' as status;
