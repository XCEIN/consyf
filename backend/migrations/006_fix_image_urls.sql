-- Fix old image URLs: replace http://localhost:4000 with relative paths
-- Run this on VPS MySQL to fix existing data

-- Fix news thumbnails
UPDATE news SET thumbnail = REPLACE(thumbnail, 'http://localhost:4000', '') 
WHERE thumbnail LIKE 'http://localhost:4000%';

-- Fix news og_image
UPDATE news SET og_image = REPLACE(og_image, 'http://localhost:4000', '') 
WHERE og_image LIKE 'http://localhost:4000%';

-- Fix news content (HTML with embedded image URLs)
UPDATE news SET content = REPLACE(content, 'http://localhost:4000', '') 
WHERE content LIKE '%http://localhost:4000%';

-- Fix posts images
UPDATE posts SET post_image = REPLACE(post_image, 'http://localhost:4000', '') 
WHERE post_image LIKE 'http://localhost:4000%';

UPDATE posts SET description_images = REPLACE(description_images, 'http://localhost:4000', '') 
WHERE description_images LIKE '%http://localhost:4000%';

-- Fix user avatars
UPDATE users SET avatar = REPLACE(avatar, 'http://localhost:4000', '') 
WHERE avatar LIKE 'http://localhost:4000%';
