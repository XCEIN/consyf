import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM news_categories ORDER BY sort_order ASC, name ASC'
    );
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get category by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [categories] = await pool.query(
      'SELECT * FROM news_categories WHERE slug = ?',
      [slug]
    );
    
    // @ts-ignore
    if (!categories || categories.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
      return;
    }
    
    // @ts-ignore
    res.json({ category: categories[0] });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const categorySchema = z.object({
      name: z.string().min(1, 'Tên danh mục không được để trống'),
      slug: z.string().min(1, 'Slug không được để trống'),
      description: z.string().optional(),
      sort_order: z.number().default(0),
    });
    
    const data = categorySchema.parse(req.body);
    
    // Check if slug exists
    const [existing] = await pool.query(
      'SELECT id FROM news_categories WHERE slug = ?',
      [data.slug]
    );
    
    // @ts-ignore
    if (existing.length > 0) {
      res.status(400).json({ message: 'Slug đã tồn tại' });
      return;
    }
    
    const [result] = await pool.query(
      'INSERT INTO news_categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
      [data.name, data.slug, data.description || null, data.sort_order]
    );
    
    res.status(201).json({ 
      message: 'Tạo danh mục thành công',
      // @ts-ignore
      categoryId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const categoryId = req.params.id;
    
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      sort_order: z.number().optional(),
    });
    
    const data = updateSchema.parse(req.body);
    
    // Check if slug exists (excluding current category)
    if (data.slug) {
      const [existing] = await pool.query(
        'SELECT id FROM news_categories WHERE slug = ? AND id != ?',
        [data.slug, categoryId]
      );
      
      // @ts-ignore
      if (existing.length > 0) {
        res.status(400).json({ message: 'Slug đã tồn tại' });
        return;
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.slug) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(data.sort_order);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
      return;
    }
    
    values.push(categoryId);
    
    await pool.query(
      `UPDATE news_categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category has news
    const [newsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM news WHERE category_id = ?',
      [categoryId]
    );
    
    // @ts-ignore
    if (newsCount[0].count > 0) {
      res.status(400).json({ 
        message: 'Không thể xóa danh mục đang có bài viết. Vui lòng chuyển bài viết sang danh mục khác trước.' 
      });
      return;
    }
    
    await pool.query('DELETE FROM news_categories WHERE id = ?', [categoryId]);
    
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
