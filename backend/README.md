# Consyf Backend (Node.js + Express + MySQL)

This backend powers Consyf: Companies, Posts, AI Embeddings & Matching.

## Setup

1. Install Node.js LTS.
2. Ensure XAMPP MySQL is running.
3. Create database `consyfnew`.
4. Copy `.env.example` to `.env` and fill values.

## Dev

- Install deps: `npm install`
- Initialize schema (optional via MySQL import): use `src/sql/schema.sql`.
- Run dev server: `npm run dev` (default port 4000)

## API

- `POST /api/companies` { name, logo?, sector?, tags?: string[] }
- `GET /api/posts` list
- `POST /api/posts` creates a post and stores embedding
- `GET /api/match/posts` matching buy/sell pairs by cosine similarity

## Notes

- Embeddings use Gemini text-embedding-004.
- Persisted vectors in `embeddings` table as JSON.
