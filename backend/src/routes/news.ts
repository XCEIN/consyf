import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Get all news (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    
    let query = 'SELECT * FROM news WHERE published = TRUE';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [news] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM news WHERE published = TRUE';
    const countParams: any[] = [];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0].total;
    
    res.json({
      news,
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
      'SELECT * FROM news WHERE slug = ? AND published = TRUE',
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
    res.json({ news: news[0] });
  } catch (error) {
    console.error('Get news detail error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create news (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const newsSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      thumbnail: z.string().url().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      published: z.boolean().default(false),
    });
    
    const data = newsSchema.parse(req.body);
    const authorId = req.user?.userId;
    
    const [result] = await pool.query(
      `INSERT INTO news (title, slug, content, excerpt, thumbnail, author_id, category, tags, published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      content: z.string().min(1).optional(),
      excerpt: z.string().optional(),
      thumbnail: z.string().url().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      published: z.boolean().optional(),
    });
    
    const data = updateSchema.parse(req.body);
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.title) {
      updates.push('title = ?');
      values.push(data.title);
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
