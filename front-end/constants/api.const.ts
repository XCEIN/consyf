// In production with Next.js rewrites, API calls go to same origin (/api/*)
// In development, falls back to localhost:4000
const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
export const API_URL = isProd ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');
