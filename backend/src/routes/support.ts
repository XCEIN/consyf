import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Get FAQ (public)
router.get('/faq', async (req, res) => {
  try {
    const category = req.query.category as string;
    
    let query = 'SELECT * FROM faq WHERE is_active = TRUE';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY order_index ASC, created_at DESC';
    
    const [faqs] = await pool.query(query, params);
    
    res.json({ faqs });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create support ticket
router.post('/tickets', async (req, res) => {
  try {
    const ticketSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      subject: z.string().min(1),
      message: z.string().min(10),
    });
    
    const data = ticketSchema.parse(req.body);
    
    const [result] = await pool.query(
      `INSERT INTO support_tickets 
       (name, email, phone, subject, message, status, priority)
       VALUES (?, ?, ?, ?, ?, 'open', 'medium')`,
      [
        data.name,
        data.email,
        data.phone || null,
        data.subject,
        data.message,
      ]
    );
    
    res.status(201).json({ 
      message: 'Gửi yêu cầu hỗ trợ thành công',
      // @ts-ignore
      ticketId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get user's tickets (authenticated)
router.get('/tickets/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    const [tickets] = await pool.query(
      `SELECT * FROM support_tickets 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({ tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get ticket by ID (authenticated or email match)
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    const email = req.query.email as string;
    
    let query = 'SELECT * FROM support_tickets WHERE id = ?';
    const params: any[] = [ticketId];
    
    if (email) {
      query += ' AND email = ?';
      params.push(email);
    }
    
    const [tickets] = await pool.query(query, params);
    
    // @ts-ignore
    if (!tickets || tickets.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy yêu cầu hỗ trợ' });
      return;
    }
    
    // @ts-ignore
    res.json({ ticket: tickets[0] });
  } catch (error) {
    console.error('Get ticket detail error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get all tickets (admin only)
router.get('/tickets', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM support_tickets WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [tickets] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM support_tickets WHERE 1=1';
    const countParams: any[] = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0].total;
    
    res.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Update ticket status (admin only)
router.put('/tickets/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const ticketId = req.params.id;
    
    const updateSchema = z.object({
      status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    });
    
    const data = updateSchema.parse(req.body);
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.status) {
      updates.push('status = ?');
      values.push(data.status);
    }
    
    if (data.priority) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
      return;
    }
    
    values.push(ticketId);
    
    await pool.query(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Cập nhật ticket thành công' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create FAQ (admin only)
router.post('/faq', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const faqSchema = z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
      category: z.string().optional(),
      order_index: z.number().default(0),
      is_active: z.boolean().default(true),
    });
    
    const data = faqSchema.parse(req.body);
    
    const [result] = await pool.query(
      `INSERT INTO faq 
       (question, answer, category, order_index, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.question,
        data.answer,
        data.category || null,
        data.order_index,
        data.is_active,
      ]
    );
    
    res.status(201).json({ 
      message: 'Tạo FAQ thành công',
      // @ts-ignore
      faqId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
