// In production with Next.js rewrites, API calls go to same origin (/api/*)
// In development, falls back to localhost:4000
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
export const API_URL = isProd ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');

// Direct backend URL for file uploads (Next.js rewrites can't proxy multipart/form-data)
// In production, uploads go through /api/... rewrites too, but we use a dedicated upload route
export const UPLOAD_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
