# CONSYF - Nền tảng Kết nối Đầu tư và Hợp tác

## 📋 Giới thiệu

CONSYF là nền tảng kết nối các nhà đầu tư, doanh nghiệp và đối tác tiềm năng. Hệ thống cho phép người dùng đăng dự án, tìm kiếm cơ hội hợp tác và kết nối với các đối tác phù hợp thông qua công nghệ AI.

## 🚀 Công nghệ sử dụng

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File upload
- **Gemini AI** - Text embedding & matching

## 📁 Cấu trúc dự án

```
consyf-full/
├── consyf-project/          # Frontend Next.js
│   ├── app/                 # App router
│   │   ├── (user)/         # User pages
│   │   ├── admin/          # Admin dashboard
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── lib/               # Utilities
│   ├── services/          # API services
│   └── public/            # Static assets
│
└── backend/               # Backend Express
    ├── src/
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   ├── middleware/   # Middleware
    │   └── db.ts        # Database connection
    ├── migrations/       # SQL migrations
    └── uploads/         # Uploaded files
```

## 🛠️ Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.x
- MySQL >= 8.x
- XAMPP/LAMPP (nếu sử dụng local MySQL)

### 1. Clone repository
```bash
git clone <repository-url>
cd consyf-full
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

#### Cấu hình .env
```bash
cp .env.example .env
```

Cập nhật file `.env`:
```env
PORT=4000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=consyfnew
MYSQL_SOCKET=/opt/lampp/var/mysql/mysql.sock

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your-gemini-api-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Chạy migrations
```bash
# Nếu dùng XAMPP/LAMPP
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/001_initial_schema.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/002_add_post_images.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/003_add_account_type.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/004_add_post_status.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/005_create_notifications.sql
```

#### Chạy backend
```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:4000`

### 3. Cài đặt Frontend

```bash
cd ../consyf-project
npm install
```

#### Cấu hình .env.local
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

#### Chạy frontend
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 👤 Tài khoản mặc định

Sau khi chạy migrations, bạn có thể tạo tài khoản mới hoặc sử dụng các tài khoản test.

### Admin
- Email: admin@consyf.com
- Password: (cần tạo qua API hoặc database)

## 📚 Tính năng chính

### Người dùng
- ✅ Đăng ký/Đăng nhập với JWT
- ✅ 2 loại tài khoản: Cá nhân & Tổ chức
- ✅ Upload avatar và ảnh dự án
- ✅ Tạo và quản lý dự án
- ✅ Tìm kiếm đối tác phù hợp (AI matching)
- ✅ Nhận thông báo về trạng thái dự án
- ✅ Chỉnh sửa thông tin cá nhân

### Tài khoản Cá nhân
- Chỉ được tạo 1 dự án duy nhất
- Sử dụng avatar làm ảnh đại diện dự án
- Upload tối đa 5 ảnh mô tả dự án
- Không thể chuyển sang Tổ chức nếu có bài approved

### Tài khoản Tổ chức
- Tạo không giới hạn số lượng dự án
- Upload ảnh đại diện riêng cho mỗi dự án
- Upload tối đa 5 ảnh mô tả cho mỗi dự án
- Quản lý nhiều dự án trong tab "Quản lý dự án"
- Chỉnh sửa/xóa dự án
- Phải xóa hết bài mới chuyển sang Cá nhân

### Admin
- ✅ Xem tất cả dự án (chờ duyệt, đã duyệt, từ chối)
- ✅ Duyệt/Từ chối dự án
- ✅ Tìm kiếm và lọc dự án
- ✅ Xem chi tiết dự án trong popup

### Hệ thống thông báo
- Tự động thông báo khi:
  - Dự án được tải lên thành công
  - Admin duyệt dự án
  - Admin từ chối dự án
- Hiển thị theo thời gian (Hôm nay, Hôm qua, Trước đó)
- Đánh dấu đã đọc/chưa đọc

## 🔌 API Endpoints

### Authentication
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/forgot-password` - Quên mật khẩu
- POST `/api/auth/reset-password` - Đặt lại mật khẩu

### Posts
- GET `/api/posts` - Lấy danh sách dự án (public)
- POST `/api/posts` - Tạo dự án mới
- GET `/api/posts/user/my` - Lấy dự án của user
- PUT `/api/posts/:id` - Cập nhật dự án
- DELETE `/api/posts/:id` - Xóa dự án
- POST `/api/posts/upload-images` - Upload ảnh dự án

### Admin
- GET `/api/posts/admin/all` - Lấy tất cả dự án (admin)
- PUT `/api/posts/:id/status` - Cập nhật trạng thái dự án

### Profile
- GET `/api/profile` - Lấy thông tin profile
- PUT `/api/profile` - Cập nhật profile
- POST `/api/profile/avatar` - Upload avatar

### Notifications
- GET `/api/notifications` - Lấy danh sách thông báo
- PUT `/api/notifications/:id/read` - Đánh dấu đã đọc
- PUT `/api/notifications/read-all` - Đánh dấu tất cả đã đọc

### Matching (AI)
- POST `/api/match` - Tìm đối tác phù hợp

## 📸 Upload Files

### Cấu trúc thư mục uploads
```
backend/uploads/
├── avatars/        # Avatar người dùng
└── posts/         # Ảnh dự án
```

### Giới hạn
- Kích thước file: Tối đa 5MB
- Định dạng: PNG, JPG, JPEG
- Số lượng ảnh mô tả: Tối đa 5 ảnh/dự án

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Responsive grid layout
- Mobile navigation menu

### User Experience
- Real-time form validation
- Loading states
- Error handling
- Success notifications
- Confirmation dialogs

### Admin Dashboard
- Modern sidebar navigation
- Filter và search
- Popup chi tiết dự án
- Overlay mờ nhẹ (10% opacity)

## 🔒 Bảo mật

- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- File upload validation
- CORS configuration
- Environment variables

## 🐛 Troubleshooting

### Backend không kết nối được MySQL
```bash
# Kiểm tra MySQL đang chạy
sudo /opt/lampp/lampp status

# Khởi động MySQL
sudo /opt/lampp/lampp startmysql
```

### Port 4000 đã được sử dụng
```bash
# Tìm process đang dùng port 4000
lsof -ti:4000

# Kill process
kill -9 <PID>
```

### Frontend không gọi được API
- Kiểm tra `NEXT_PUBLIC_BACKEND_URL` trong `.env.local`
- Kiểm tra CORS settings trong backend
- Xem Network tab trong Browser DevTools

## 📝 License

[License Type] - [Year] [Your Name/Organization]

## 👥 Contributors

- [Your Name] - Full Stack Developer

## 📞 Contact

- Email: your-email@example.com
- Website: https://your-website.com

---

Made with ❤️ by CONSYF Team
