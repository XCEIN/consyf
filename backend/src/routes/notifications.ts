import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const unreadOnly = req.query.unread === 'true';

    let query = `
      SELECT n.*, p.title as post_title
      FROM notifications n
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = ?
    `;
    
    if (unreadOnly) {
      query += ' AND n.is_read = FALSE';
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ?';

    const [notifications] = await pool.query(query, [userId, limit]);

    // Get unread count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    ) as any[];

    res.json({
      notifications,
      unread_count: countResult[0].unread_count,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Helper function to create notification (exported for use in other routes)
export async function createNotification(
  userId: number,
  postId: number | null,
  type: 'post_uploaded' | 'post_approved' | 'post_rejected',
  title: string,
  content: string
) {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, post_id, type, title, content) VALUES (?, ?, ?, ?, ?)',
      [userId, postId, type, title, content]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
}

export default router;
