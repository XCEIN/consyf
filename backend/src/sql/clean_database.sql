-- Clean all data from database tables
-- Date: 2025-12-01
-- This will delete all records but keep table structure

SET FOREIGN_KEY_CHECKS = 0;

-- Clear all posts and related data
TRUNCATE TABLE embeddings;
TRUNCATE TABLE posts;

-- Clear companies
TRUNCATE TABLE companies;

-- Clear email verifications and password resets
TRUNCATE TABLE email_verifications;
TRUNCATE TABLE password_resets;

-- Clear users (keep admin if needed, or delete all)
-- Option 1: Delete all users
TRUNCATE TABLE users;

-- Option 2: Keep admin user only (uncomment if you want to keep admin)
-- DELETE FROM users WHERE role != 'admin';

SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE companies AUTO_INCREMENT = 1;
ALTER TABLE posts AUTO_INCREMENT = 1;
ALTER TABLE embeddings AUTO_INCREMENT = 1;
ALTER TABLE email_verifications AUTO_INCREMENT = 1;
ALTER TABLE password_resets AUTO_INCREMENT = 1;

SELECT 'Database cleaned successfully!' as status;
