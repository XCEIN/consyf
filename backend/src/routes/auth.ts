import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { pool } from '../db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import crypto from 'crypto';

const router = Router();

// Validation schemas
const RegisterSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên tài khoản'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/(?=.*[A-Z])|(?=.*[!@#$%^&*])/, 'Phải có ký tự đặc biệt hoặc viết hoa'),
});

const LoginSchema = z.object({
  username: z.string().min(5, 'Tên tài khoản ít nhất 5 ký tự'),
  password: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự'),
});

const VerifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4, 'OTP phải có 4 chữ số'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/(?=.*[A-Z])|(?=.*[!@#$%^&*])/, 'Phải có ký tự đặc biệt hoặc viết hoa'),
});

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
    
    const { name, email, phone, password } = parsed.data;

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, email_verified) VALUES (?, ?, ?, ?, FALSE)',
      [name, email, phone, passwordHash]
    );
    // @ts-ignore
    const userId = result.insertId as number;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      'INSERT INTO email_verifications (user_id, otp, expires_at) VALUES (?, ?, ?)',
      [userId, otp, expiresAt]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, otp, name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue anyway - user can request resend
    }

    res.status(201).json({ 
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
      userId,
      email,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Show OTP in dev mode for testing
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng ký' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const parsed = VerifyEmailSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

    const { email, otp } = parsed.data;

    // Find user
    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    // @ts-ignore
    const userId = userRows[0].id;

    // Check OTP
    const [verifications] = await pool.query(
      'SELECT * FROM email_verifications WHERE user_id = ? AND otp = ? AND verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, otp]
    );
    // @ts-ignore
    if (verifications.length === 0) {
      return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    // Mark as verified
    // @ts-ignore
    await pool.query('UPDATE email_verifications SET verified = TRUE WHERE id = ?', [verifications[0].id]);
    await pool.query('UPDATE users SET email_verified = TRUE WHERE id = ?', [userId]);

    // Get user info
    const [users] = await pool.query('SELECT id, name, email, phone, role, avatar, account_type FROM users WHERE id = ?', [userId]);
    // @ts-ignore
    const user = users[0];

    // Generate JWT token
    const jwtSecret: Secret = process.env.JWT_SECRET || 'default_secret';
    const jwtOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
    const token = jwt.sign(
      { userId, email, accountType: user.account_type || 'user' },
      jwtSecret,
      jwtOptions
    );

    res.json({ 
      message: 'Xác thực email thành công',
      token,
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        phone: user.phone,
        role: user.role || 'user',
        avatar: user.avatar,
        account_type: user.account_type,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi xác thực email' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });

    const [users] = await pool.query('SELECT id, name, email_verified FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (users.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    // @ts-ignore
    const user = users[0];
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email đã được xác thực' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      'INSERT INTO email_verifications (user_id, otp, expires_at) VALUES (?, ?, ?)',
      [user.id, otp, expiresAt]
    );

    await sendVerificationEmail(email, otp, user.name);

    res.json({ message: 'Mã OTP mới đã được gửi đến email của bạn' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

    const { username, password } = parsed.data;

    // Find user by email or phone (username can be either)
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [username, username]
    );
    // @ts-ignore
    if (users.length === 0) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    // @ts-ignore
    const user = users[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Check if email verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Vui lòng xác thực email trước khi đăng nhập',
        requireVerification: true,
        email: user.email,
      });
    }

    // Generate JWT token
    const jwtSecret: Secret = process.env.JWT_SECRET || 'default_secret';
    const jwtOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
    const token = jwt.sign(
      { userId: user.id, email: user.email, accountType: user.account_type || 'user' },
      jwtSecret,
      jwtOptions
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        avatar: user.avatar,
        account_type: user.account_type,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

    const { email } = parsed.data;

    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
    // @ts-ignore
    if (users.length === 0) {
      // Don't reveal if email exists or not
      return res.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' });
    }
    // @ts-ignore
    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, expiresAt]
    );

    await sendPasswordResetEmail(email, resetToken, user.name);

    res.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

    const { token, password } = parsed.data;

    // Find valid token
    const [resets] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW() LIMIT 1',
      [token]
    );
    // @ts-ignore
    if (resets.length === 0) {
      return res.status(400).json({ error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }
    // @ts-ignore
    const reset = resets[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, reset.user_id]);
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [reset.id]);

    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi' });
  }
});

// GET /api/auth/me (protected route example)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: number };

    const [users] = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    // @ts-ignore
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // @ts-ignore
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
