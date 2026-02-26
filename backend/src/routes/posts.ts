import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db.js';
import { embedText } from '../services/embedding.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createNotification } from './notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Helper function to convert relative paths to full URLs
const getFullImageUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath; // Already full URL
  }
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  return `${backendUrl}${relativePath}`;
};

// Setup multer for post images upload
const postImagesDir = path.join(__dirname, '../../uploads/posts');
if (!fs.existsSync(postImagesDir)) {
  fs.mkdirSync(postImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'post_image' ? 'post-' : 'desc-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

const PostSchema = z.object({
  company_id: z.number().int(),
  type: z.enum(['buy', 'sell']),
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  budget: z.number().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  post_image: z.string().optional(), // URL của ảnh đại diện dự án (tổ chức only)
  description_images: z.string().optional(), // JSON string array các URL ảnh mô tả (max 5)
  status: z.enum(['pending', 'approved', 'rejected']).optional(), // Status for re-approval
});

// Get all posts with filtering (public - only approved posts)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const search = req.query.search as string;
    const category = req.query.category as string;
    const type = req.query.type as string;
    const location = req.query.location as string;
    const sort = req.query.sort as string || 'newest';
    const minBudget = req.query.minBudget ? parseFloat(req.query.minBudget as string) : null;
    const maxBudget = req.query.maxBudget ? parseFloat(req.query.maxBudget as string) : null;
    
    let query = `
      SELECT p.*, c.name as company_name, c.logo as company_logo, 
             u.name as user_name, u.avatar as user_avatar, u.account_type
      FROM posts p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE p.status = 'approved'
    `;
    const params: any[] = [];
    
    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }
    
    if (type) {
      query += ' AND p.type = ?';
      params.push(type);
    }
    
    if (location) {
      query += ' AND p.location = ?';
      params.push(location);
    }
    
    if (minBudget !== null) {
      query += ' AND p.budget >= ?';
      params.push(minBudget);
    }
    
    if (maxBudget !== null) {
      query += ' AND p.budget <= ?';
      params.push(maxBudget);
    }
    
    // Count total - build separate count query
    let countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM posts p 
      LEFT JOIN companies c ON p.company_id = c.id 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE p.status = 'approved'`;
    const countParams = [...params]; // Copy params for count query
    
    if (search) countQuery += ' AND (p.title LIKE ? OR p.description LIKE ?)';
    if (category) countQuery += ' AND p.category = ?';
    if (type) countQuery += ' AND p.type = ?';
    if (location) countQuery += ' AND p.location = ?';
    if (minBudget !== null) countQuery += ' AND p.budget >= ?';
    if (maxBudget !== null) countQuery += ' AND p.budget <= ?';
    
    const [countResult] = await pool.query(countQuery, countParams) as any;
    const total = countResult[0]?.total || 0;
    
    // Add sorting and pagination
    query += sort === 'oldest' ? ' ORDER BY p.created_at ASC' : ' ORDER BY p.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.query(query, params) as any[];
    
    // Convert relative image paths to full URLs
    const postsWithFullUrls = rows.map((post: any) => ({
      ...post,
      post_image: getFullImageUrl(post.post_image),
    }));
    
    res.json({
      posts: postsWithFullUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Upload post images endpoint
// post_image: single file (tổ chức only)
// description_images: max 5 files (cả 2 loại tài khoản)
router.post('/upload-images', authenticateToken, upload.fields([
  { name: 'post_image', maxCount: 1 },
  { name: 'description_images', maxCount: 5 }
]), async (req: AuthRequest, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: { post_image?: string; description_images?: string[] } = {};
    
    // Get backend URL from environment or use default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    if (files.post_image && files.post_image[0]) {
      result.post_image = `${backendUrl}/uploads/posts/${files.post_image[0].filename}`;
    }
    
    if (files.description_images) {
      result.description_images = files.description_images.map(
        file => `${backendUrl}/uploads/posts/${file.filename}`
      );
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload images' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, 
              c.name as company_name, 
              c.logo as company_logo,
              u.name as user_name,
              u.avatar as user_avatar,
              u.email as user_email,
              u.phone as user_phone,
              u.account_type
       FROM posts p 
       JOIN companies c ON p.company_id = c.id 
       JOIN users u ON c.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    // @ts-ignore
    const post = rows?.[0];
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Convert image paths to full URLs
    post.post_image = getFullImageUrl(post.post_image);
    post.user_avatar = getFullImageUrl(post.user_avatar);
    
    res.json({ post });
  } catch (error) {
    console.error('Get post by id error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// Get user's own posts
router.get('/user/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      `SELECT p.*, c.name as company_name, c.logo as company_logo 
       FROM posts p 
       JOIN companies c ON p.company_id = c.id 
       WHERE c.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    
    // Convert image paths to full URLs
    // @ts-ignore
    const posts = (rows as any[]).map(post => ({
      ...post,
      post_image: getFullImageUrl(post.post_image),
      // description_images is JSON string, keep as is (will be converted in frontend or when displaying)
    }));
    
    res.json({ posts });
  } catch (error: any) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch posts' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check user account type and get avatar
    const [userRows] = await pool.query(
      'SELECT account_type, avatar FROM users WHERE id = ?',
      [userId]
    );
    // @ts-ignore
    const user = userRows?.[0];
    const accountType = user?.account_type || 'personal';

    // Check if personal account already has a post
    if (accountType === 'personal') {
      const [existingPosts] = await pool.query(
        'SELECT COUNT(*) as count FROM posts p JOIN companies c ON p.company_id = c.id WHERE c.user_id = ?',
        [userId]
      );
      // @ts-ignore
      if (existingPosts[0].count >= 1) {
        return res.status(403).json({ 
          message: 'Tài khoản cá nhân chỉ được đăng tối đa 1 dự án. Vui lòng nâng cấp lên tài khoản tổ chức để đăng nhiều dự án.' 
        });
      }
    }

    // Parse body, handle tags as string from frontend
    const bodyData = {
      ...req.body,
      tags: req.body.tags && typeof req.body.tags === 'string' 
        ? req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : req.body.tags
    };

    const parsed = PostSchema.safeParse(bodyData);
    if (!parsed.success) return res.status(400).json(parsed.error.format());
    const p = parsed.data;

    // Verify company belongs to user
    const [companyRows] = await pool.query(
      'SELECT id FROM companies WHERE id = ? AND user_id = ?',
      [p.company_id, userId]
    );
    // @ts-ignore
    if (!companyRows || companyRows.length === 0) {
      return res.status(403).json({ message: 'Company does not belong to user' });
    }

    // Handle post_image: if personal account and no post_image provided, use user avatar
    let postImage = p.post_image || null;
    if (accountType === 'personal' && !postImage) {
      // @ts-ignore
      postImage = user?.avatar || null;
    }

    const [result] = await pool.query(
      'INSERT INTO posts (company_id, type, title, description, category, budget, location, tags, post_image, description_images) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        p.company_id, 
        p.type, 
        p.title, 
        p.description, 
        p.category, 
        p.budget ?? null, 
        p.location ?? null, 
        (p.tags||[]).join(','),
        postImage,
        p.description_images || null
      ]
    );
    // @ts-ignore
    const postId = result.insertId as number;
    try {
      const vector = await embedText(p.description);
      await pool.query('INSERT INTO embeddings (post_id, vector_dim, vector_json) VALUES (?,?,?)', [postId, vector.length, JSON.stringify(vector)]);
    } catch (e) {
      console.error('Embedding error', e);
    }
    
    // Create notification for post uploaded
    await createNotification(
      userId,
      postId,
      'post_uploaded',
      'Dự án của bạn đã được tải lên thành công',
      `Chúng tôi đã nhận được dự án "${p.title}". Hệ thống sẽ tiến hành duyệt trong vòng 24 giờ.`
    );
    
    res.status(201).json({ id: postId, message: 'Post created successfully' });
  } catch (error: any) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create post' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('PUT /api/posts/:id - Request body:', JSON.stringify(req.body, null, 2));
    const parsed = PostSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error.format());
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.format() });
    }
    const p = parsed.data;
    
    // Verify post belongs to user
    const [postRows] = await pool.query(
      'SELECT p.id FROM posts p JOIN companies c ON p.company_id = c.id WHERE p.id = ? AND c.user_id = ?',
      [req.params.id, userId]
    );
    // @ts-ignore
    if (!postRows || postRows.length === 0) {
      return res.status(403).json({ message: 'You do not have permission to edit this post' });
    }
    
    const fields = [] as string[];
    const values = [] as any[];
    for (const [k,v] of Object.entries(p)) {
      fields.push(`${k}=?`);
      values.push(k === 'tags' ? (v as string[]).join(',') : v);
    }
    if (!fields.length) return res.json({ ok: true });
    values.push(req.params.id);
    await pool.query(`UPDATE posts SET ${fields.join(', ')} WHERE id=?`, values);
    res.json({ ok: true, message: 'Post updated successfully' });
  } catch (error: any) {
    console.error('Post update error:', error);
    res.status(500).json({ message: error.message || 'Failed to update post' });
  }
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM embeddings WHERE post_id=?', [req.params.id]);
  await pool.query('DELETE FROM posts WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// Admin: Get all posts (including pending/rejected)
router.get('/admin/all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [user?.userId]);
    // @ts-ignore
    if (!users || users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    
    let query = `
      SELECT p.*, c.name as company_name, c.logo as company_logo,
             u.name as user_name, u.email as user_email, u.avatar as user_avatar, u.account_type
      FROM posts p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
    `;
    const params: any[] = [];
    
    if (status && status !== 'all') {
      query += ' WHERE p.status = ?';
      params.push(status);
    }
    
    // Count total
    let countQuery = `SELECT COUNT(*) as total FROM posts p`;
    if (status && status !== 'all') {
      countQuery += ' WHERE p.status = ?';
    }
    const countParams = status && status !== 'all' ? [status] : [];
    const [countResult] = await pool.query(countQuery, countParams);
    // @ts-ignore
    const total = countResult[0]?.total || 0;
    
    // Add sorting and pagination
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.query(query, params) as any[];
    
    // Convert relative image paths to full URLs
    const postsWithFullUrls = rows.map((post: any) => ({
      ...post,
      post_image: getFullImageUrl(post.post_image),
    }));
    
    res.json({
      posts: postsWithFullUrls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get admin posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Admin: Update post status
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [user?.userId]);
    // @ts-ignore
    if (!users || users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { status } = req.body;
    const postId = req.params.id;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Get post info to create notification
    const [posts] = await pool.query(
      'SELECT p.*, c.user_id FROM posts p LEFT JOIN companies c ON p.company_id = c.id WHERE p.id = ?',
      [postId]
    ) as any[];
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = posts[0];
    const userId = post.user_id;
    
    // Update post status
    await pool.query('UPDATE posts SET status = ? WHERE id = ?', [status, postId]);
    
    // Create notification
    let notifTitle = '';
    let notifContent = '';
    let notifType: 'post_uploaded' | 'post_approved' | 'post_rejected' = 'post_uploaded';
    
    if (status === 'approved') {
      notifType = 'post_approved';
      notifTitle = 'Dự án của bạn đã được duyệt';
      notifContent = `Dự án "${post.title}" đáp ứng đầy đủ tiêu chí cộng đồng và đã được xuất bản trên thư viện số.`;
    } else if (status === 'rejected') {
      notifType = 'post_rejected';
      notifTitle = 'Dự án của bạn chưa được duyệt';
      notifContent = `Dự án "${post.title}" bị từ chối do thiếu thông tin mô tả rõ ràng và tài liệu không đạt định dạng yêu cầu (PDF). Vui lòng chỉnh sửa và gửi lại.`;
    }
    
    if (userId && notifTitle) {
      await createNotification(userId, parseInt(postId), notifType, notifTitle, notifContent);
    }
    
    res.json({ message: `Post ${status} successfully` });
  } catch (error) {
    console.error('Update post status error:', error);
    res.status(500).json({ message: 'Failed to update post status' });
  }
});

export default router;
