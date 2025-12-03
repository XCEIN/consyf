import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const jobType = req.query.job_type as string;
    const location = req.query.location as string;
    
    let query = 'SELECT * FROM jobs WHERE is_active = TRUE';
    const params: any[] = [];
    
    if (jobType) {
      query += ' AND job_type = ?';
      params.push(jobType);
    }
    
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [jobs] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM jobs WHERE is_active = TRUE';
    const countParams: any[] = [];
    
    if (jobType) {
      countQuery += ' AND job_type = ?';
      countParams.push(jobType);
    }
    
    if (location) {
      countQuery += ' AND location LIKE ?';
      countParams.push(`%${location}%`);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0].total;
    
    res.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get job by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const [jobs] = await pool.query(
      'SELECT * FROM jobs WHERE slug = ? AND is_active = TRUE',
      [slug]
    );
    
    // @ts-ignore
    if (!jobs || jobs.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      return;
    }
    
    // Increment view count
    await pool.query(
      'UPDATE jobs SET views = views + 1 WHERE slug = ?',
      [slug]
    );
    
    // @ts-ignore
    res.json({ job: jobs[0] });
  } catch (error) {
    console.error('Get job detail error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Apply for a job
router.post('/:id/apply', async (req, res) => {
  try {
    const jobId = req.params.id;
    
    const applicationSchema = z.object({
      full_name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(10),
      cv_file: z.string().url().optional(),
      cover_letter: z.string().optional(),
    });
    
    const data = applicationSchema.parse(req.body);
    
    // Check if job exists and is active
    const [jobs] = await pool.query(
      'SELECT id FROM jobs WHERE id = ? AND is_active = TRUE',
      [jobId]
    );
    
    // @ts-ignore
    if (!jobs || jobs.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      return;
    }
    
    const [result] = await pool.query(
      `INSERT INTO job_applications 
       (job_id, full_name, email, phone, cv_file, cover_letter, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        jobId,
        data.full_name,
        data.email,
        data.phone,
        data.cv_file || null,
        data.cover_letter || null,
      ]
    );
    
    res.status(201).json({ 
      message: 'Nộp đơn ứng tuyển thành công',
      // @ts-ignore
      applicationId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Apply job error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get user's applications (authenticated)
router.get('/applications/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    const [applications] = await pool.query(
      `SELECT ja.*, j.title as job_title, j.company_name, j.location
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       WHERE ja.user_id = ?
       ORDER BY ja.created_at DESC`,
      [userId]
    );
    
    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Create job (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const jobSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      company_name: z.string().min(1),
      company_logo: z.string().url().optional(),
      location: z.string().min(1),
      job_type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
      salary_min: z.number().optional(),
      salary_max: z.number().optional(),
      description: z.string().min(1),
      requirements: z.string().optional(),
      benefits: z.string().optional(),
      deadline: z.string().optional(),
      is_active: z.boolean().default(true),
    });
    
    const data = jobSchema.parse(req.body);
    
    const [result] = await pool.query(
      `INSERT INTO jobs 
       (title, slug, company_name, company_logo, location, job_type, salary_min, salary_max, 
        description, requirements, benefits, deadline, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.slug,
        data.company_name,
        data.company_logo || null,
        data.location,
        data.job_type,
        data.salary_min || null,
        data.salary_max || null,
        data.description,
        data.requirements || null,
        data.benefits || null,
        data.deadline || null,
        data.is_active,
      ]
    );
    
    res.status(201).json({ 
      message: 'Tạo tin tuyển dụng thành công',
      // @ts-ignore
      jobId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
