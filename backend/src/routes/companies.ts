import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const CompanySchema = z.object({
  name: z.string().min(2),
  logo: z.string().url().optional(),
  sector: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
  res.json(rows);
});

// Get user's companies
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ companies: rows });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const parsed = CompanySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.format());
    const c = parsed.data;
    const [result] = await pool.query(
      'INSERT INTO companies (user_id, name, logo, sector, tags) VALUES (?,?,?,?,?)',
      [userId, c.name, c.logo ?? null, c.sector ?? null, (c.tags||[]).join(',')]
    );
    // @ts-ignore
    const companyId = result.insertId as number;
    res.status(201).json({ companyId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
