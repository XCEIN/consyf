import { Router } from 'express';
import { pool } from '../db.js';

function cosineSim(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * (b[i]||0), 0);
  const na = Math.sqrt(a.reduce((s,v) => s + v*v, 0));
  const nb = Math.sqrt(b.reduce((s,v) => s + v*v, 0));
  return na && nb ? dot / (na * nb) : 0;
}

const router = Router();

// Return matches between buy and sell posts
router.get('/posts', async (_req, res) => {
  const [rows] = await pool.query('SELECT e.post_id, p.type, e.vector_json FROM embeddings e JOIN posts p ON p.id = e.post_id');
  const byType: Record<'buy'|'sell', Array<{id:number, vec:number[]}>> = { buy: [], sell: [] };
  // @ts-ignore
  for (const r of rows) {
    const vec = JSON.parse(r.vector_json as string) as number[];
    byType[r.type as 'buy'|'sell'].push({ id: r.post_id as number, vec });
  }
  const matches: Array<{buy_id:number, sell_id:number, score:number}> = [];
  for (const b of byType.buy) {
    for (const s of byType.sell) {
      const score = cosineSim(b.vec, s.vec);
      if (score > 0.75) matches.push({ buy_id: b.id, sell_id: s.id, score: Number(score.toFixed(4)) });
    }
  }
  res.json(matches.sort((a,b)=> b.score - a.score).slice(0, 100));
});

export default router;
