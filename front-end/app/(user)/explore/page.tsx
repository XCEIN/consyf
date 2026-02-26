import { listPosts, listMatches } from "@/services/post.service";

export default async function ExplorePage() {
  const posts = await listPosts();
  const matches = await listMatches();
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
