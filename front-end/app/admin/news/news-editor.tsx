"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Link,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  Search as SearchIcon,
  Globe,
  Tag,
  Loader2,
  Trash2,
  Check,
  Images,
  Strikethrough,
  Minus,
  Type,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/constants/api.const";

// ─── Types ───
interface NewsEditorProps {
  mode: "create" | "edit";
  newsId?: string;
}

interface NewsData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  allow_comments: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  og_image: string;
}

const defaultNewsData: NewsData = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  thumbnail: "",
  category: "",
  tags: "",
  published: false,
  featured: false,
  allow_comments: true,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_image: "",
};

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MediaImage {
  filename: string;
  url: string;
  path: string;
  size: number;
  created_at: string;
}

// ─── Helpers ───
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getToken = () => localStorage.getItem("token");

// ─── Main Component ───
export default function NewsEditor({ mode, newsId }: NewsEditorProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const mediaUploadRef = useRef<HTMLInputElement>(null);

  const [newsData, setNewsData] = useState<NewsData>(defaultNewsData);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Media Library state
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaInsertTarget, setMediaInsertTarget] = useState<"content" | "thumbnail">("content");

  // Font size dropdown
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  // ─── Data Fetching ───
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/news-categories`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (mode === "edit" && newsId) fetchNewsData();
  }, [mode, newsId]);

  const fetchNewsData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/news/admin/${newsId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const n = res.data.news;
      setNewsData({
        title: n.title || "",
        slug: n.slug || "",
        content: n.content || "",
        excerpt: n.excerpt || "",
        thumbnail: n.thumbnail || "",
        category: n.category || "",
        tags: n.tags || "",
        published: Boolean(n.published),
        featured: Boolean(n.featured),
        allow_comments: n.allow_comments !== undefined ? Boolean(n.allow_comments) : true,
        meta_title: n.meta_title || "",
        meta_description: n.meta_description || "",
        meta_keywords: n.meta_keywords || "",
        canonical_url: n.canonical_url || "",
        og_image: n.og_image || "",
      });
      setSlugEdited(true);
    } catch (err) {
      console.error("Fetch news error:", err);
      alert("Không thể tải bài viết");
      router.push("/admin/news");
    } finally {
      setLoading(false);
    }
  };

  // ─── Slug auto-generate & check ───
  useEffect(() => {
    if (!slugEdited && newsData.title) {
      setNewsData((prev) => ({ ...prev, slug: generateSlug(newsData.title) }));
    }
  }, [newsData.title, slugEdited]);

  const checkSlug = useCallback(
    async (slug: string) => {
      if (!slug) { setSlugAvailable(null); return; }
      try {
        const params = new URLSearchParams({ excludeId: newsId || "" });
        const res = await axios.get(`${API_URL}/api/news/check-slug/${slug}?${params}`);
        setSlugAvailable(res.data.available);
      } catch { setSlugAvailable(null); }
    },
    [newsId]
  );

  useEffect(() => {
    const t = setTimeout(() => { if (newsData.slug) checkSlug(newsData.slug); }, 500);
    return () => clearTimeout(t);
  }, [newsData.slug, checkSlug]);

  // ─── Editor Commands ───
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const sel = window.getSelection();
    const text = sel?.toString() || "";
    const url = prompt("Nhập URL:", "https://");
    if (!url) return;
    if (text) {
      exec("createLink", url);
    } else {
      const label = prompt("Nhập tiêu đề liên kết:", url) || url;
      exec("insertHTML", `<a href="${url}" target="_blank">${label}</a>`);
    }
  };

  const insertHR = () => {
    exec("insertHTML", "<hr/>");
  };

  const setFontSize = (size: string) => {
    exec("fontSize", size);
    setShowFontSizeMenu(false);
  };

  const clearFormatting = () => {
    exec("removeFormat");
  };

  // ─── Image Upload (inline) ───
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(`${API_URL}/api/news/upload-image`, fd, {
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
      });
      exec("insertHTML", `<img src="${res.data.url}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:0.5em;margin:1em 0;" />`);
    } catch (err) {
      console.error("Upload image error:", err);
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Thumbnail Upload ───
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(`${API_URL}/api/news/upload-image`, fd, {
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
      });
      setNewsData((prev) => ({ ...prev, thumbnail: res.data.url }));
    } catch (err) {
      console.error("Upload thumbnail error:", err);
      alert("Lỗi khi tải ảnh thumbnail");
    }
  };

  // ─── Media Library ───
  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await axios.get(`${API_URL}/api/news/media-library`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMediaImages(res.data.images || []);
    } catch (err) {
      console.error("Fetch media library error:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const openMediaLibrary = (target: "content" | "thumbnail") => {
    setMediaInsertTarget(target);
    setShowMediaLibrary(true);
    fetchMediaLibrary();
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("image", file);
        await axios.post(`${API_URL}/api/news/upload-image`, fd, {
          headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
        });
      }
      fetchMediaLibrary();
    } catch (err) {
      console.error("Upload media error:", err);
      alert("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingMedia(false);
      if (mediaUploadRef.current) mediaUploadRef.current.value = "";
    }
  };

  const handleMediaSelect = (image: MediaImage) => {
    if (mediaInsertTarget === "content") {
      editorRef.current?.focus();
      exec("insertHTML", `<img src="${image.url}" alt="${image.filename}" style="max-width:100%;height:auto;border-radius:0.5em;margin:1em 0;" />`);
    } else {
      setNewsData((prev) => ({ ...prev, thumbnail: image.url }));
    }
    setShowMediaLibrary(false);
  };

  const handleMediaDelete = async (filename: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    try {
      await axios.delete(`${API_URL}/api/news/media-library/${filename}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchMediaLibrary();
    } catch (err) {
      console.error("Delete media error:", err);
      alert("Lỗi khi xóa ảnh");
    }
  };

  // ─── Save ───
  const handleSave = async (publish?: boolean) => {
    if (!newsData.title.trim()) { alert("Vui lòng nhập tiêu đề bài viết"); return; }
    if (!newsData.slug.trim()) { alert("Vui lòng nhập URL slug"); return; }
    if (!editorRef.current?.innerHTML.trim()) { alert("Vui lòng nhập nội dung bài viết"); return; }
    if (slugAvailable === false) { alert("URL slug đã tồn tại, vui lòng chọn slug khác"); return; }

    setSaving(true);
    try {
      const content = editorRef.current?.innerHTML || "";
      const payload = { ...newsData, content, published: publish !== undefined ? publish : newsData.published };

      if (mode === "create") {
        await axios.post(`${API_URL}/api/news`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        alert("Tạo bài viết thành công!");
      } else {
        await axios.put(`${API_URL}/api/news/${newsId}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        alert("Cập nhật bài viết thành công!");
      }
      router.push("/admin/news");
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  // Set editor content when data loads (edit mode)
  useEffect(() => {
    if (editorRef.current && newsData.content && mode === "edit") {
      editorRef.current.innerHTML = newsData.content;
    }
  }, [newsData.content, mode]);

  // ─── Keyboard Shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [newsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 lg:gap-12 py-12">
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-6 space-y-6">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/news")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Lưu nháp
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Xuất bản
            </Button>
          </div>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* ─── Editor Column ─── */}
          <div className="space-y-4">
            {/* Title */}
            <div className="bg-white rounded-lg border p-4">
              <input
                type="text"
                placeholder="Nhập tiêu đề bài viết..."
                value={newsData.title}
                onChange={(e) => setNewsData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
              />
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 flex-shrink-0">/news/</span>
                <input
                  type="text"
                  placeholder="url-bai-viet"
                  value={newsData.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setNewsData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                  }}
                  className="flex-1 text-sm text-blue-600 border-none outline-none bg-transparent"
                />
                {slugAvailable !== null && (
                  <span className={cn("text-xs flex-shrink-0 font-medium", slugAvailable ? "text-green-600" : "text-red-600")}>
                    {slugAvailable ? "✓ Khả dụng" : "✗ Đã tồn tại"}
                  </span>
                )}
              </div>
            </div>

            {/* Editor with Toolbar */}
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50">
                <TBtn onClick={() => exec("undo")} title="Hoàn tác (Ctrl+Z)"><Undo className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("redo")} title="Làm lại (Ctrl+Y)"><Redo className="w-4 h-4" /></TBtn>
                <TSep />

                {/* Block formats */}
                <TBtn onClick={() => exec("formatBlock", "h1")} title="Tiêu đề 1"><Heading1 className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("formatBlock", "h2")} title="Tiêu đề 2"><Heading2 className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("formatBlock", "h3")} title="Tiêu đề 3"><Heading3 className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("formatBlock", "p")} title="Đoạn văn"><span className="text-xs font-bold">P</span></TBtn>
                <TSep />

                {/* Font size dropdown */}
                <div className="relative">
                  <TBtn onClick={() => setShowFontSizeMenu(!showFontSizeMenu)} title="Cỡ chữ">
                    <Type className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </TBtn>
                  {showFontSizeMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-30 min-w-[120px]">
                      {[
                        { label: "Rất nhỏ", val: "1" },
                        { label: "Nhỏ", val: "2" },
                        { label: "Bình thường", val: "3" },
                        { label: "Vừa", val: "4" },
                        { label: "Lớn", val: "5" },
                        { label: "Rất lớn", val: "6" },
                        { label: "Cực lớn", val: "7" },
                      ].map((s) => (
                        <button key={s.val} onClick={() => setFontSize(s.val)} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <TSep />

                {/* Inline formats */}
                <TBtn onClick={() => exec("bold")} title="In đậm (Ctrl+B)"><Bold className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("italic")} title="In nghiêng (Ctrl+I)"><Italic className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("underline")} title="Gạch chân (Ctrl+U)"><Underline className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("strikeThrough")} title="Gạch ngang"><Strikethrough className="w-4 h-4" /></TBtn>
                <TBtn onClick={clearFormatting} title="Xóa định dạng"><X className="w-4 h-4" /></TBtn>
                <TSep />

                {/* Color picker */}
                <div className="relative">
                  <label className="p-1.5 hover:bg-gray-200 rounded text-gray-700 cursor-pointer flex items-center" title="Màu chữ">
                    <span className="text-xs font-bold border-b-2 border-red-500 px-0.5">A</span>
                    <input type="color" className="absolute w-0 h-0 opacity-0" onChange={(e) => exec("foreColor", e.target.value)} />
                  </label>
                </div>
                <div className="relative">
                  <label className="p-1.5 hover:bg-gray-200 rounded text-gray-700 cursor-pointer flex items-center" title="Màu nền">
                    <span className="text-xs font-bold bg-yellow-200 px-1 rounded">A</span>
                    <input type="color" className="absolute w-0 h-0 opacity-0" onChange={(e) => exec("hiliteColor", e.target.value)} />
                  </label>
                </div>
                <TSep />

                {/* Alignment */}
                <TBtn onClick={() => exec("justifyLeft")} title="Căn trái"><AlignLeft className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("justifyCenter")} title="Căn giữa"><AlignCenter className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("justifyRight")} title="Căn phải"><AlignRight className="w-4 h-4" /></TBtn>
                <TSep />

                {/* Lists & block */}
                <TBtn onClick={() => exec("insertUnorderedList")} title="Danh sách"><List className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("insertOrderedList")} title="Danh sách số"><ListOrdered className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("formatBlock", "blockquote")} title="Trích dẫn"><Quote className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => exec("formatBlock", "pre")} title="Code block"><Code className="w-4 h-4" /></TBtn>
                <TBtn onClick={insertHR} title="Đường kẻ ngang"><Minus className="w-4 h-4" /></TBtn>
                <TSep />

                {/* Link & Image & Media */}
                <TBtn onClick={insertLink} title="Chèn liên kết"><Link className="w-4 h-4" /></TBtn>
                <TBtn onClick={() => fileInputRef.current?.click()} title="Tải ảnh lên" disabled={uploadingImage}>
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </TBtn>
                <TBtn onClick={() => openMediaLibrary("content")} title="Thư viện ảnh">
                  <Images className="w-4 h-4" />
                </TBtn>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Editor area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[500px] p-6 focus:outline-none text-base text-gray-800 leading-relaxed overflow-auto"
                style={{ lineHeight: 1.8, wordBreak: "break-word" }}
                onPaste={(e) => {
                  // Allow pasting HTML content
                  const html = e.clipboardData.getData("text/html");
                  if (html) {
                    e.preventDefault();
                    // Clean dangerous tags but keep formatting
                    const cleaned = html
                      .replace(/<script[\s\S]*?<\/script>/gi, "")
                      .replace(/<style[\s\S]*?<\/style>/gi, "")
                      .replace(/on\w+="[^"]*"/gi, "");
                    document.execCommand("insertHTML", false, cleaned);
                  }
                }}
                onDrop={async (e) => {
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && files[0].type.startsWith("image/")) {
                    e.preventDefault();
                    const fd = new FormData();
                    fd.append("image", files[0]);
                    try {
                      const res = await axios.post(`${API_URL}/api/news/upload-image`, fd, {
                        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
                      });
                      exec("insertHTML", `<img src="${res.data.url}" alt="${files[0].name}" style="max-width:100%;height:auto;border-radius:0.5em;margin:1em 0;" />`);
                    } catch {
                      alert("Lỗi khi tải ảnh lên");
                    }
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              />
              {/* Editor typography styles */}
              <style jsx global>{`
                [contenteditable] h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; line-height: 1.3; }
                [contenteditable] h2 { font-size: 1.5em; font-weight: 600; margin: 0.75em 0; line-height: 1.3; }
                [contenteditable] h3 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0; line-height: 1.3; }
                [contenteditable] p { margin: 0.5em 0; }
                [contenteditable] ul, [contenteditable] ol { padding-left: 1.5em; margin: 0.5em 0; }
                [contenteditable] ul { list-style-type: disc; }
                [contenteditable] ol { list-style-type: decimal; }
                [contenteditable] li { margin: 0.25em 0; }
                [contenteditable] blockquote {
                  border-left: 4px solid #d1d5db; padding: 0.75em 1em; margin: 1em 0;
                  color: #6b7280; font-style: italic; background: #f9fafb; border-radius: 0 0.5em 0.5em 0;
                }
                [contenteditable] pre {
                  background: #1f2937; color: #e5e7eb; padding: 1em; border-radius: 0.5em;
                  overflow-x: auto; font-family: 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.9em; margin: 1em 0;
                }
                [contenteditable] code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 0.25em; font-size: 0.9em; }
                [contenteditable] pre code { background: transparent; padding: 0; }
                [contenteditable] img {
                  max-width: 100%; height: auto; border-radius: 0.5em; margin: 1em 0; cursor: pointer;
                  transition: box-shadow 0.2s;
                }
                [contenteditable] img:hover { box-shadow: 0 0 0 3px #3b82f6; }
                [contenteditable] a { color: #2563eb; text-decoration: underline; }
                [contenteditable] a:hover { color: #1d4ed8; }
                [contenteditable] hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
                [contenteditable] table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                [contenteditable] td, [contenteditable] th { border: 1px solid #d1d5db; padding: 0.5em; }
                [contenteditable]:empty::before { content: "Bắt đầu viết nội dung bài viết tại đây..."; color: #9ca3af; pointer-events: none; }
              `}</style>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg border p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt bài viết</label>
              <textarea
                placeholder="Nhập tóm tắt ngắn gọn về bài viết (hiển thị trong danh sách bài viết)..."
                value={newsData.excerpt}
                onChange={(e) => setNewsData((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">{newsData.excerpt.length}/300 ký tự</p>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-4">
            {/* Settings Panel */}
            <div className="bg-white rounded-lg border">
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Cài đặt bài viết</span>
                </div>
                {showSettingsPanel ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showSettingsPanel && (
                <div className="p-4 border-t space-y-4">
                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
                    {newsData.thumbnail ? (
                      <div className="relative group">
                        <img src={newsData.thumbnail} alt="Thumbnail" className="w-full h-40 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => openMediaLibrary("thumbnail")}
                            className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow"
                            title="Thay đổi"
                          >
                            <Images className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setNewsData((prev) => ({ ...prev, thumbnail: "" }))}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
                            title="Xóa"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="flex-1 h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        >
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-xs">Tải lên</span>
                        </button>
                        <button
                          onClick={() => openMediaLibrary("thumbnail")}
                          className="flex-1 h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                        >
                          <Images className="w-5 h-5 mb-1" />
                          <span className="text-xs">Thư viện</span>
                        </button>
                      </div>
                    )}
                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                  </div>

                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Danh mục</label>
                      <a href="/admin/news/categories" target="_blank" className="text-xs text-blue-600 hover:text-blue-700">Quản lý</a>
                    </div>
                    <select
                      value={newsData.category}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-3.5 h-3.5 inline mr-1" />
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="tag1, tag2, tag3 (phân cách bằng dấu phẩy)"
                      value={newsData.tags}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, tags: e.target.value }))}
                      className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-2">
                    <ToggleSwitch
                      label="Bài viết nổi bật"
                      checked={newsData.featured}
                      onChange={(v) => setNewsData((prev) => ({ ...prev, featured: v }))}
                    />
                    <ToggleSwitch
                      label="Cho phép bình luận"
                      checked={newsData.allow_comments}
                      onChange={(v) => setNewsData((prev) => ({ ...prev, allow_comments: v }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEO Panel */}
            <div className="bg-white rounded-lg border">
              <button
                onClick={() => setShowSeoPanel(!showSeoPanel)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <SearchIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Cài đặt SEO</span>
                </div>
                {showSeoPanel ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showSeoPanel && (
                <div className="p-4 border-t space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      placeholder={newsData.title || "Tiêu đề SEO"}
                      value={newsData.meta_title}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, meta_title: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className={cn("text-xs mt-1", (newsData.meta_title || newsData.title).length > 60 ? "text-red-500" : "text-gray-400")}>
                      {(newsData.meta_title || newsData.title).length}/60
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      placeholder="Mô tả cho công cụ tìm kiếm..."
                      value={newsData.meta_description}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, meta_description: e.target.value }))}
                      rows={3}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    />
                    <p className={cn("text-xs mt-1", newsData.meta_description.length > 160 ? "text-red-500" : "text-gray-400")}>
                      {newsData.meta_description.length}/160
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      placeholder="keyword1, keyword2"
                      value={newsData.meta_keywords}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, meta_keywords: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newsData.canonical_url}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, canonical_url: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      placeholder="URL ảnh cho social media"
                      value={newsData.og_image}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, og_image: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  {/* Google Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Xem trước trên Google</p>
                    <div className="text-blue-700 text-sm font-medium truncate">
                      {newsData.meta_title || newsData.title || "Tiêu đề bài viết"}
                    </div>
                    <div className="text-green-700 text-xs truncate">
                      consyf.vn/news/{newsData.slug || "url-bai-viet"}
                    </div>
                    <div className="text-gray-600 text-xs line-clamp-2 mt-0.5">
                      {newsData.meta_description || newsData.excerpt || "Mô tả bài viết sẽ hiển thị ở đây..."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Media Library Modal ─── */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMediaLibrary(false)}>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Images className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Thư viện ảnh</h2>
                  <p className="text-sm text-gray-500">{mediaImages.length} ảnh • Chọn hoặc tải ảnh lên</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => mediaUploadRef.current?.click()}
                  disabled={uploadingMedia}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Tải lên
                </button>
                <input ref={mediaUploadRef} type="file" accept="image/*" multiple onChange={handleMediaUpload} className="hidden" />
                <button onClick={() => setShowMediaLibrary(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingMedia ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : mediaImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Images className="w-16 h-16 mb-3" />
                  <p className="text-lg font-medium">Chưa có ảnh nào</p>
                  <p className="text-sm">Hãy tải ảnh lên để bắt đầu!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaImages.map((img) => (
                    <div key={img.filename} className="group relative border rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer bg-gray-50">
                      <div className="aspect-square relative">
                        <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleMediaSelect(img)}
                            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100"
                            title="Chọn ảnh"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMediaDelete(img.filename); }}
                            className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate font-medium">{img.filename}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(img.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toolbar Sub-components ───
function TBtn({ onClick, title, disabled, children }: { onClick: () => void; title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center"
      title={title}
    >
      {children}
    </button>
  );
}

function TSep() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5" />;
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-gray-300"
        )}
      >
        <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow", checked ? "translate-x-4.5" : "translate-x-0.5")} />
      </button>
    </label>
  );
}
