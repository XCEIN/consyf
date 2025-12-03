import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Setup multer for avatar upload
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Get user profile
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    // Try with all columns first, fallback to basic columns if error
    let users;
    try {
      [users] = await pool.query(
        'SELECT id, name, email, phone, avatar, account_type, role, created_at FROM users WHERE id = ?',
        [userId]
      );
    } catch (err: any) {
      // Fallback if columns don't exist (shouldn't happen after migration)
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        [users] = await pool.query(
          'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
          [userId]
        );
      } else {
        throw err;
      }
    }
    
    // @ts-ignore
    if (!users || users.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }
    
    // @ts-ignore
    const user = users[0];
    
    // Return user data directly (not nested in 'user' object for frontend compatibility)
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!req.file) {
      res.status(400).json({ message: 'Không có file được tải lên' });
      return;
    }
    
    // Generate avatar URL
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    
    // Update user avatar in database
    await pool.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, userId]
    );
    
    res.json({ avatarUrl, message: 'Upload avatar thành công' });
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().min(10).optional(),
      avatar: z.string().url().optional(),
      account_type: z.enum(['personal', 'organization']).optional(),
    });
    
    const data = updateSchema.parse(req.body);
    
    // Validate account_type change
    if (data.account_type) {
      // Get current account_type
      const [currentUser] = await pool.query(
        'SELECT account_type FROM users WHERE id = ?',
        [userId]
      );
      // @ts-ignore
      const currentAccountType = currentUser?.[0]?.account_type;

      if (currentAccountType !== data.account_type) {
        // Changing account type - need to check posts
        const [userPosts] = await pool.query(
          `SELECT p.id, p.status 
           FROM posts p 
           JOIN companies c ON p.company_id = c.id 
           WHERE c.user_id = ?`,
          [userId]
        );
        // @ts-ignore
        const posts = userPosts as any[];

        // Personal → Organization: Cannot change if has approved post
        if (currentAccountType === 'personal' && data.account_type === 'organization') {
          const hasApprovedPost = posts.some(p => p.status === 'approved');
          if (hasApprovedPost) {
            return res.status(403).json({ 
              message: 'Không thể chuyển sang tài khoản tổ chức khi đang có bài đăng đã được duyệt. Vui lòng gỡ bài đăng trước.' 
            });
          }
        }

        // Organization → Personal: Must delete all posts first
        if (currentAccountType === 'organization' && data.account_type === 'personal') {
          if (posts.length > 0) {
            // Delete all user's posts
            const postIds = posts.map(p => p.id);
            if (postIds.length > 0) {
              await pool.query(
                'DELETE FROM embeddings WHERE post_id IN (?)',
                [postIds]
              );
              await pool.query(
                'DELETE FROM posts WHERE id IN (?)',
                [postIds]
              );
            }
          }
        }
      }
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.phone) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.avatar) {
      updates.push('avatar = ?');
      values.push(data.avatar);
    }
    if (data.account_type) {
      updates.push('account_type = ?');
      values.push(data.account_type);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
      return;
    }
    
    values.push(userId);
    
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Get updated user
    const [users] = await pool.query(
      'SELECT id, name, email, phone, avatar, account_type, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    // @ts-ignore
    const user = users[0];
    let message = 'Cập nhật thông tin thành công';
    
    // Add special message if account type changed to personal from organization
    if (data.account_type === 'personal') {
      const [currentUser] = await pool.query(
        'SELECT account_type FROM users WHERE id = ?',
        [userId]
      );
      // Check if there were posts deleted
      const [postsCount] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM posts p 
         JOIN companies c ON p.company_id = c.id 
         WHERE c.user_id = ?`,
        [userId]
      );
      // @ts-ignore
      if (postsCount[0].count === 0 && data.account_type) {
        message = 'Chuyển sang tài khoản cá nhân thành công. Tất cả bài đăng của tổ chức đã được xóa.';
      }
    }
    
    res.json({ message, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: error.errors });
      return;
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );
    
    // @ts-ignore
    const total = countResult[0].total;
    
    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    
    res.json({ message: 'Đánh dấu đã đọc thành công' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Get user projects (posts created by user's company)
router.get('/projects', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    // Get user's companies
    const [companies] = await pool.query(
      'SELECT id FROM companies WHERE user_id = ?',
      [userId]
    );
    
    // @ts-ignore
    if (!companies || companies.length === 0) {
      res.json({ projects: [] });
      return;
    }
    
    // @ts-ignore
    const companyIds = companies.map(c => c.id);
    
    // Get posts for these companies
    const [posts] = await pool.query(
      `SELECT p.*, c.name as company_name, c.logo as company_logo 
       FROM posts p
       JOIN companies c ON p.company_id = c.id
       WHERE p.company_id IN (?)
       ORDER BY p.created_at DESC`,
      [companyIds]
    );
    
    res.json({ projects: posts });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default router;
