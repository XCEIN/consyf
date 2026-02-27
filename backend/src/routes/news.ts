import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Setup upload directory for news images
const newsImagesDir = path.join(__dirname, '../../uploads/news');
if (!fs.existsSync(newsImagesDir)) {
  fs.mkdirSync(newsImagesDir, { recursive: true });
}

// Multer configuration for news images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, newsImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'thumbnail' ? 'thumb-' : 'content-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
});

// Helper function to get image URL - returns relative path for proxy compatibility
const getImageUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null;
  // If already a full URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    // Convert absolute localhost URLs to relative paths
    const localhostPattern = /^https?:\/\/localhost:\d+/;
    if (localhostPattern.test(relativePath)) {
      return relativePath.replace(localhostPattern, '');
    }
    return relativePath;
  }
  // Already a relative path like /uploads/news/...
  return relativePath;
};

// Upload image for news content
router.post('/upload-image', authenticateToken, requireAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
      return;
    }
    const imageUrl = `/uploads/news/${req.file.filename}`;
    res.json({ 
      success: true,
      url: getImageUrl(imageUrl),
      path: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Lỗi upload ảnh' });
  }
});

// Get all images in media library
router.get('/media-library', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const files = fs.readdirSync(newsImagesDir)
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map(filename => {
        const filePath = path.join(newsImagesDir, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          url: getImageUrl(`/uploads/news/${filename}`),
          path: `/uploads/news/${filename}`,
          size: stats.size,
          created_at: stats.birthtime,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ images: files });
  } catch (error) {
    console.error('Media library error:', error);
    res.status(500).json({ message: 'Lỗi tải thư viện ảnh' });
  }
});

// Delete image from media library
router.delete('/media-library/:filename', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(newsImagesDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Đã xóa ảnh' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Lỗi xóa ảnh' });
  }
});

// Get all news for admin (includes unpublished)
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string; // all, published, draft
    const search = req.query.search as string;
    
    let query = 'SELECT n.*, u.name as author_name FROM news n LEFT JOIN users u ON n.author_id = u.id';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (status === 'published') {
      conditions.push('n.published = TRUE');
    } else if (status === 'draft') {
      conditions.push('n.published = FALSE');
    }
    
    if (search) {
      conditions.push('(n.title LIKE ? OR n.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [news] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM news n';
    const countParams: any[] = [];
    const countConditions: string[] = [];
    
    if (status === 'published') {
      countConditions.push('n.published = TRUE');
    } else if (status === 'draft') {
      countConditions.push('n.published = FALSE');
    }
    
    if (search) {
      countConditions.push('(n.title LIKE ? OR n.content LIKE ?)');
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0].total;
    
    // Process thumbnail URLs
    // @ts-ignore
    const newsWithUrls = news.map((item: any) => ({
      ...item,
      thumbnail: getImageUrl(item.thumbnail)
    }));
    
    res.json({
      news: newsWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin news error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get news by ID for admin (includes unpublished)
router.get('/admin/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const [news] = await pool.query(
      'SELECT * FROM news WHERE id = ?',
      [id]
    );
    
    // @ts-ignore
    if (!news || news.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
      return;
    }
    
    // @ts-ignore
    const newsItem = news[0];
    newsItem.thumbnail = getImageUrl(newsItem.thumbnail);
    
    res.json({ news: newsItem });
  } catch (error) {
    console.error('Get news detail error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Check slug availability
router.get('/check-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const excludeId = req.query.excludeId as string;
    
    let query = 'SELECT id FROM news WHERE slug = ?';
    const params: any[] = [slug];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [result] = await pool.query(query, params);
    // @ts-ignore
    const exists = result.length > 0;
    
    res.json({ available: !exists });
  } catch (error) {
    console.error('Check slug error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get all news (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const featured = req.query.featured as string;
    
    let query = 'SELECT n.*, u.name as author_name FROM news n LEFT JOIN users u ON n.author_id = u.id WHERE n.published = TRUE';
    const params: any[] = [];
    
    if (category) {
      query += ' AND n.category = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND n.featured = TRUE';
    }
    
    query += ' ORDER BY n.published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [news] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM news WHERE published = TRUE';
    const countParams: any[] = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (featured === 'true') {
      countQuery += ' AND featured = TRUE';
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0].total;
    
    // Process thumbnail URLs
    // @ts-ignore
    const newsWithUrls = news.map((item: any) => ({
      ...item,
      thumbnail: getImageUrl(item.thumbnail),
      og_image: getImageUrl(item.og_image)
    }));

    res.json({
      news: newsWithUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get news by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [news] = await pool.query(
      `SELECT n.*, u.name as author_name FROM news n 
       LEFT JOIN users u ON n.author_id = u.id 
       WHERE n.slug = ? AND n.published = TRUE`,
      [slug]
    );
    
    // @ts-ignore
    if (!news || news.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
      return;
    }
    
    // Increment view count
    await pool.query(
      'UPDATE news SET views = views + 1 WHERE slug = ?',
      [slug]
    );
    
    // @ts-ignore
    const newsItem = news[0];
    newsItem.thumbnail = getImageUrl(newsItem.thumbnail);
    newsItem.og_image = getImageUrl(newsItem.og_image);
    
    res.json({ news: newsItem });
  } catch (error) {
    console.error('Get news detail error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create news (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const newsSchema = z.object({
      title: z.string().min(1, 'Tiêu đề không được để trống'),
      slug: z.string().min(1, 'URL slug không được để trống'),
      content: z.string().min(1, 'Nội dung không được để trống'),
      excerpt: z.string().optional(),
      thumbnail: z.string().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      published: z.preprocess((v) => v === 1 || v === true, z.boolean()).default(false),
      // SEO fields
      meta_title: z.string().optional(),
      meta_description: z.string().optional(),
      meta_keywords: z.string().optional(),
      canonical_url: z.string().optional(),
      og_image: z.string().optional(),
      // Content settings
      allow_comments: z.preprocess((v) => v === 1 || v === true, z.boolean()).default(true),
      featured: z.preprocess((v) => v === 1 || v === true, z.boolean()).default(false),
    });
    
    const data = newsSchema.parse(req.body);
    const authorId = req.user?.userId;
    
    const [result] = await pool.query(
      `INSERT INTO news (title, slug, content, excerpt, thumbnail, author_id, category, tags, published, published_at, meta_title, meta_description, meta_keywords, canonical_url, og_image, allow_comments, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.slug,
        data.content,
        data.excerpt || null,
        data.thumbnail || null,
        authorId,
        data.category || null,
        data.tags || null,
        data.published,
        data.published ? new Date() : null,
        data.meta_title || null,
        data.meta_description || null,
        data.meta_keywords || null,
        data.canonical_url || null,
        data.og_image || null,
        data.allow_comments ?? true,
        data.featured ?? false,
      ]
    );
    
    res.status(201).json({ 
      message: 'Tạo bài viết thành công',
      // @ts-ignore
      newsId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Create news error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Update news (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const newsId = req.params.id;
    
    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      excerpt: z.string().optional(),
      thumbnail: z.string().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      published: z.preprocess((v) => v === undefined ? undefined : (v === 1 || v === true), z.boolean()).optional(),
      // SEO fields
      meta_title: z.string().optional(),
      meta_description: z.string().optional(),
      meta_keywords: z.string().optional(),
      canonical_url: z.string().optional(),
      og_image: z.string().optional(),
      // Content settings
      allow_comments: z.preprocess((v) => v === undefined ? undefined : (v === 1 || v === true), z.boolean()).optional(),
      featured: z.preprocess((v) => v === undefined ? undefined : (v === 1 || v === true), z.boolean()).optional(),
    });
    
    const data = updateSchema.parse(req.body);
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.title) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.slug) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.content) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(data.excerpt);
    }
    if (data.thumbnail !== undefined) {
      updates.push('thumbnail = ?');
      values.push(data.thumbnail);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(data.tags);
    }
    if (data.published !== undefined) {
      updates.push('published = ?');
      values.push(data.published);
      if (data.published) {
        updates.push('published_at = ?');
        values.push(new Date());
      }
    }
    // SEO fields
    if (data.meta_title !== undefined) {
      updates.push('meta_title = ?');
      values.push(data.meta_title);
    }
    if (data.meta_description !== undefined) {
      updates.push('meta_description = ?');
      values.push(data.meta_description);
    }
    if (data.meta_keywords !== undefined) {
      updates.push('meta_keywords = ?');
      values.push(data.meta_keywords);
    }
    if (data.canonical_url !== undefined) {
      updates.push('canonical_url = ?');
      values.push(data.canonical_url);
    }
    if (data.og_image !== undefined) {
      updates.push('og_image = ?');
      values.push(data.og_image);
    }
    if (data.allow_comments !== undefined) {
      updates.push('allow_comments = ?');
      values.push(data.allow_comments);
    }
    if (data.featured !== undefined) {
      updates.push('featured = ?');
      values.push(data.featured);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
      return;
    }
    
    values.push(newsId);
    
    await pool.query(
      `UPDATE news SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Cập nhật bài viết thành công' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Update news error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Delete news (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const newsId = req.params.id;
    
    await pool.query('DELETE FROM news WHERE id = ?', [newsId]);
    
    res.json({ message: 'Xóa bài viết thành công' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
