import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple paths to find .env
const envPaths = [
  path.resolve(__dirname, '../.env'),       // from src/ → backend/.env
  path.resolve(__dirname, '../../.env'),     // in case tsx resolves differently
  path.resolve(process.cwd(), '.env'),       // from working directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`[dotenv] Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  } else {
    console.log(`[dotenv] Not found: ${envPath}`);
  }
}
if (!envLoaded) {
  console.error('[dotenv] ❌ No .env file found! Trying default dotenv.config()...');
  dotenv.config();
}

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { router as apiRouter } from './routes/index.js';

const app = express();

// CORS configuration - support multiple origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', apiRouter);

// Multer error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File quá lớn. Giới hạn 5MB.' });
      return;
    }
    res.status(400).json({ message: `Upload error: ${err.message}` });
    return;
  }
  if (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
    return;
  }
  next();
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`[consyf-backend] listening on port ${port}`);
  // Log email config status
  console.log(`[Email] SMTP_USER: ${process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '...' : '❌ NOT SET'}`);
  console.log(`[Email] SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set' : '❌ NOT SET'}`);
});
