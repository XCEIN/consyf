import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Get all promotions (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const categoryId = req.query.category_id as string;
    
    let query = `
      SELECT p.*, pc.name as category_name 
      FROM promotions p
      LEFT JOIN promotion_categories pc ON p.category_id = pc.id
      WHERE p.is_active = TRUE
    `;
    const params: any[] = [];
    
    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [promotions] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM promotions WHERE is_active = TRUE';
    const countParams: any[] = [];
    
    if (categoryId) {
      countQuery += ' AND category_id = ?';
      countParams.push(categoryId);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0].total;
    
    res.json({
      promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get promotion by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [promotions] = await pool.query(
      `SELECT p.*, pc.name as category_name 
       FROM promotions p
       LEFT JOIN promotion_categories pc ON p.category_id = pc.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );
    
    // @ts-ignore
    if (!promotions || promotions.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy chương trình khuyến mãi' });
      return;
    }
    
    // @ts-ignore
    res.json({ promotion: promotions[0] });
  } catch (error) {
    console.error('Get promotion detail error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get promotion categories (public)
router.get('/categories/all', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM promotion_categories ORDER BY name'
    );
    
    res.json({ categories });
  } catch (error) {
    console.error('Get promotion categories error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create promotion (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const promotionSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      content: z.string().optional(),
      thumbnail: z.string().url().optional(),
      category_id: z.number().optional(),
      discount_percent: z.number().min(0).max(100).optional(),
      discount_amount: z.number().min(0).optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      is_active: z.boolean().default(true),
    });
    
    const data = promotionSchema.parse(req.body);
    
    const [result] = await pool.query(
      `INSERT INTO promotions 
       (title, slug, description, content, thumbnail, category_id, discount_percent, discount_amount, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.slug,
        data.description || null,
        data.content || null,
        data.thumbnail || null,
        data.category_id || null,
        data.discount_percent || null,
        data.discount_amount || null,
        data.start_date || null,
        data.end_date || null,
        data.is_active,
      ]
    );
    
    res.status(201).json({ 
      message: 'Tạo chương trình khuyến mãi thành công',
      // @ts-ignore
      promotionId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Create promotion error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create promotion category (admin only)
router.post('/categories', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const categorySchema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
    });
    
    const data = categorySchema.parse(req.body);
    
    const [result] = await pool.query(
      'INSERT INTO promotion_categories (name, slug, description) VALUES (?, ?, ?)',
      [data.name, data.slug, data.description || null]
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

export default router;
