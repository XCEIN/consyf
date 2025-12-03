-- Migration: Add missing columns to users table

-- Add role column if not exists
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER is_active;

-- Add avatar column if not exists
ALTER TABLE users 
ADD COLUMN avatar VARCHAR(512) AFTER role;

-- Add account_type column if not exists
ALTER TABLE users 
ADD COLUMN account_type VARCHAR(50) AFTER avatar;

-- Check the result
SELECT 'Migration completed successfully!' as status;
DESCRIBE users;
