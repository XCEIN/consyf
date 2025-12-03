-- Clean database but keep admin user
-- Date: 2025-12-01

SET FOREIGN_KEY_CHECKS = 0;

-- Clear all posts and related data
TRUNCATE TABLE embeddings;
TRUNCATE TABLE posts;

-- Clear companies
TRUNCATE TABLE companies;

-- Clear email verifications and password resets
TRUNCATE TABLE email_verifications;
TRUNCATE TABLE password_resets;

-- Keep admin user, delete others if any
DELETE FROM users WHERE role != 'admin';

SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment (start from next available ID)
ALTER TABLE companies AUTO_INCREMENT = 1;
ALTER TABLE posts AUTO_INCREMENT = 1;
ALTER TABLE embeddings AUTO_INCREMENT = 1;
ALTER TABLE email_verifications AUTO_INCREMENT = 1;
ALTER TABLE password_resets AUTO_INCREMENT = 1;

SELECT 'Database cleaned! Admin user kept.' as status;
SELECT id, email, name, role, account_type FROM users;
