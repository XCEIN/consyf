-- Migration: Add status column and admin features to posts table

-- Add status column to posts
ALTER TABLE posts 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER tags;

-- Add index for better performance
ALTER TABLE posts ADD INDEX idx_status (status);
ALTER TABLE posts ADD INDEX idx_type (type);
ALTER TABLE posts ADD INDEX idx_category (category);
ALTER TABLE posts ADD INDEX idx_created_at (created_at);

-- Check the result
SELECT 'Migration completed successfully!' as status;
DESCRIBE posts;
