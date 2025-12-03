# CONSYF - Investment & Collaboration Connection Platform

## 📋 Overview

CONSYF is a platform that connects investors, businesses, and potential partners. The system allows users to post projects, search for collaboration opportunities, and connect with suitable partners through AI technology.

## 🚀 Tech Stack

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

## 📁 Project Structure

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

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 18.x
- MySQL >= 8.x
- XAMPP/LAMPP (for local MySQL)

### 1. Clone Repository
```bash
git clone <repository-url>
cd consyf-full
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure .env
```bash
cp .env.example .env
```

Update `.env` file:
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

#### Run Migrations
```bash
# If using XAMPP/LAMPP
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/001_initial_schema.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/002_add_post_images.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/003_add_account_type.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/004_add_post_status.sql
/opt/lampp/bin/mysql -u root --socket=/opt/lampp/var/mysql/mysql.sock consyfnew < migrations/005_create_notifications.sql
```

#### Start Backend
```bash
npm run dev
```

Backend will run at: `http://localhost:4000`

### 3. Frontend Setup

```bash
cd ../consyf-project
npm install
```

#### Configure .env.local
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

#### Start Frontend
```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

## 👤 Default Accounts

After running migrations, you can create new accounts or use test accounts.

### Admin
- Email: admin@consyf.com
- Password: (create via API or database)

## 📚 Key Features

### User Features
- ✅ Register/Login with JWT
- ✅ 2 account types: Personal & Organization
- ✅ Upload avatar and project images
- ✅ Create and manage projects
- ✅ Find suitable partners (AI matching)
- ✅ Receive project status notifications
- ✅ Edit personal information

### Personal Account
- Can create only 1 project
- Uses avatar as project thumbnail
- Upload up to 5 project description images
- Cannot switch to Organization if has approved posts

### Organization Account
- Create unlimited projects
- Upload separate thumbnail for each project
- Upload up to 5 description images per project
- Manage multiple projects in "Project Management" tab
- Edit/Delete projects
- Must delete all posts before switching to Personal

### Admin Features
- ✅ View all projects (pending, approved, rejected)
- ✅ Approve/Reject projects
- ✅ Search and filter projects
- ✅ View project details in popup

### Notification System
- Automatic notifications when:
  - Project uploaded successfully
  - Admin approves project
  - Admin rejects project
- Display by time (Today, Yesterday, Earlier)
- Mark as read/unread

## 🔌 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new account
- POST `/api/auth/login` - Login
- POST `/api/auth/forgot-password` - Forgot password
- POST `/api/auth/reset-password` - Reset password

### Posts
- GET `/api/posts` - Get projects list (public)
- POST `/api/posts` - Create new project
- GET `/api/posts/user/my` - Get user's projects
- PUT `/api/posts/:id` - Update project
- DELETE `/api/posts/:id` - Delete project
- POST `/api/posts/upload-images` - Upload project images

### Admin
- GET `/api/posts/admin/all` - Get all projects (admin)
- PUT `/api/posts/:id/status` - Update project status

### Profile
- GET `/api/profile` - Get profile information
- PUT `/api/profile` - Update profile
- POST `/api/profile/avatar` - Upload avatar

### Notifications
- GET `/api/notifications` - Get notifications list
- PUT `/api/notifications/:id/read` - Mark as read
- PUT `/api/notifications/read-all` - Mark all as read

### Matching (AI)
- POST `/api/match` - Find suitable partners

## 📸 File Uploads

### Upload Directory Structure
```
backend/uploads/
├── avatars/        # User avatars
└── posts/         # Project images
```

### Upload Limits
- File size: Maximum 5MB
- Format: PNG, JPG, JPEG
- Description images: Maximum 5 images per project

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

## 🔒 Security

- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- File upload validation
- CORS configuration
- Environment variables

## 🐛 Troubleshooting

### Backend Cannot Connect to MySQL
```bash
# Check if MySQL is running
sudo /opt/lampp/lampp status

# Start MySQL
sudo /opt/lampp/lampp startmysql
```

### Port 4000 Already in Use
```bash
# Find process using port 4000
lsof -ti:4000

# Kill process
kill -9 <PID>
```

### Frontend Cannot Call API
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check CORS settings in backend
- Check Network tab in Browser DevTools

## 📝 License

[License Type] - [Year] [Your Name/Organization]

## 👥 Contributors

- [Your Name] - Full Stack Developer

## 📞 Contact

- Email: your-email@example.com
- Website: https://your-website.com

---

Made with ❤️ by CONSYF Team
