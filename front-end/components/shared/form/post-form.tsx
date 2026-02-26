"use client";
import { useState } from "react";
import { createPost, PostInput } from "@/services/post.service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PostForm({ companyId }: { companyId: number }) {
  const [form, setForm] = useState<PostInput>({
    company_id: companyId,
    type: "buy",
    title: "",
    description: "",
    category: "",
    budget: undefined,
    location: "",
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await createPost(form);
      setMessage(`Đã đăng bài #${res.id}. Vector đã lưu.`);
      setForm({ ...form, title: "", description: "" });
    } catch (err: any) {
      setMessage("Có lỗi khi đăng bài");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-3">
        <label className="text-sm">Loại</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          className="border rounded px-2 py-1"
        >
          <option value="buy">Cần mua</option>
          <option value="sell">Cung cấp</option>
        </select>
      </div>
      <Input
        placeholder="Tiêu đề"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <Textarea
        placeholder="Mô tả chi tiết"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        placeholder="Danh mục"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Ngân sách (optional)"
        value={form.budget ?? ""}
        onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
      />
      <Input
        placeholder="Vị trí (tỉnh/thành)"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <Input
        placeholder="Tags (phân cách bởi dấu phẩy)"
        value={(form.tags || []).join(",")}
        onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}
      />
      <Button type="submit" disabled={loading}>{loading ? "Đang đăng..." : "Đăng bài"}</Button>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </form>
  );
}
