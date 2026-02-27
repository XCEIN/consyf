import * as nodemailer from 'nodemailer';

// Lazy-create transporter to ensure env vars are loaded
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    console.log('[Email] Creating SMTP transporter:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : 'NOT SET',
      passSet: !!process.env.SMTP_PASS,
    });

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(to: string, otp: string, userName: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject: 'Xác thực tài khoản Consyf - Mã OTP của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D92F4;">Chào mừng đến với Consyf!</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Consyf. Để hoàn tất đăng ký, vui lòng sử dụng mã OTP bên dưới:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #0D92F4; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>Mã này sẽ hết hiệu lực sau <strong>5 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Email này được gửi từ hệ thống Consyf. Vui lòng không trả lời email này.</p>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string, userName: string) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject: 'Consyf - Yêu cầu đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0D92F4;">Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0D92F4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p>Hoặc sao chép link sau vào trình duyệt:</p>
        <p style="word-break: break-all; color: #0D92F4;">${resetUrl}</p>
        <p>Link này sẽ hết hiệu lực sau <strong>1 giờ</strong>.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Email này được gửi từ hệ thống Consyf. Vui lòng không trả lời email này.</p>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
}
