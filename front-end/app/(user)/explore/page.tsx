"use client";

import { listPosts, listMatches } from "@/services/post.service";
import { useEffect, useState } from "react";
import { Post } from "@/services/post.service";

interface Match {
  buy_id: number;
  sell_id: number;
  score: number;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, matchesRes] = await Promise.all([
          listPosts(),
          listMatches(),
        ]);
        setPosts(postsRes?.posts || []);
        setMatches(matchesRes || []);
      } catch (err) {
        console.error("Failed to fetch explore data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <section>
        <h1 className="text-xl font-bold">Khám phá</h1>
        <ul className="grid gap-2">
          {posts.map((p:any)=> (
            <li key={p.id} className="p-3 border rounded">
              <div className="text-sm opacity-70">{p.type.toUpperCase()} • {p.category} • {p.location}</div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm">{p.description}</div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Gợi ý Matching (AI)</h2>
        <ul className="grid gap-2">
          {matches.map((m)=> (
            <li key={`${m.buy_id}-${m.sell_id}`} className="p-2 border rounded text-sm">
              Bài mua #{m.buy_id} ↔ Bài bán #{m.sell_id} • Score: {m.score}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
