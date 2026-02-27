"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Eye,
  Tag,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/constants/api.const";

interface NewsDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string | null;
  category: string;
  tags: string;
  views: number;
  featured: boolean;
  author_name?: string;
  published_at: string;
  created_at: string;
  meta_title?: string;
  meta_description?: string;
}

interface RelatedNews {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  category: string;
  published_at: string;
}

interface NewsDetailPageProps {
  slug: string;
}

export default function NewsDetailPage({ slug }: NewsDetailPageProps) {
  const router = useRouter();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchNewsDetail();
  }, [slug]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/news/${slug}`);
      setNews(response.data.news);

      // Fetch related news
      if (response.data.news.category) {
        const relatedResponse = await axios.get(
          `${API_URL}/api/news?category=${response.data.news.category}&limit=4`
        );
        const filtered = relatedResponse.data.news.filter(
          (item: RelatedNews) => item.id !== response.data.news.id
        );
        setRelatedNews(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error("Fetch news error:", error);
      router.push("/news");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} phút đọc`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = news?.title || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="h-[400px] bg-gray-200 rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy bài viết
          </h1>
          <Link
            href="/news"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/news" className="hover:text-blue-600">
              Tin tức
            </Link>
            {news.category && news.category !== "Tin tức" && (
              <>
                <ChevronRight className="w-4 h-4" />
                <Link
                  href={`/news?category=${news.category}`}
                  className="hover:text-blue-600"
                >
                  {news.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {news.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          {/* Article Header */}
          <header className="mb-8">
            {news.category && (
              <Link
                href={`/news?category=${news.category}`}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4 hover:bg-blue-200"
              >
                {news.category}
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {news.title}
            </h1>
            {news.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{news.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(news.published_at || news.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getReadingTime(news.content)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {news.views.toLocaleString()} lượt xem
              </span>
              {news.author_name && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {news.author_name}
                </span>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {news.thumbnail && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={news.thumbnail}
                alt={news.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Share buttons */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Chia sẻ:
            </span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <button
              onClick={handleCopyLink}
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Article Content */}
          <article
            className="news-content max-w-none mb-10"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
          <style jsx global>{`
            .news-content {
              font-size: 1.125rem;
              line-height: 1.9;
              color: #1f2937;
              word-break: break-word;
            }
            .news-content > * + * {
              margin-top: 1.25em;
            }
            .news-content h1 {
              font-size: 2em;
              font-weight: 700;
              line-height: 1.3;
              margin-top: 1.5em;
              margin-bottom: 0.6em;
              color: #111827;
            }
            .news-content h2 {
              font-size: 1.5em;
              font-weight: 700;
              line-height: 1.35;
              margin-top: 1.5em;
              margin-bottom: 0.6em;
              color: #111827;
              padding-bottom: 0.3em;
              border-bottom: 1px solid #e5e7eb;
            }
            .news-content h3 {
              font-size: 1.25em;
              font-weight: 600;
              line-height: 1.4;
              margin-top: 1.3em;
              margin-bottom: 0.5em;
              color: #111827;
            }
            .news-content p {
              margin-top: 0.75em;
              margin-bottom: 0.75em;
              line-height: 1.9;
            }
            .news-content ul,
            .news-content ol {
              padding-left: 1.75em;
              margin-top: 0.75em;
              margin-bottom: 0.75em;
            }
            .news-content ul {
              list-style-type: disc;
            }
            .news-content ol {
              list-style-type: decimal;
            }
            .news-content li {
              margin-top: 0.4em;
              margin-bottom: 0.4em;
              line-height: 1.8;
            }
            .news-content li > p {
              margin-top: 0.25em;
              margin-bottom: 0.25em;
            }
            .news-content blockquote {
              border-left: 4px solid #3b82f6;
              padding: 1em 1.25em;
              margin: 1.25em 0;
              color: #4b5563;
              font-style: italic;
              background: #f8fafc;
              border-radius: 0 0.5em 0.5em 0;
            }
            .news-content pre {
              background: #1f2937;
              color: #e5e7eb;
              padding: 1.25em;
              border-radius: 0.75em;
              overflow-x: auto;
              font-family: 'Fira Code', 'JetBrains Mono', monospace;
              font-size: 0.875em;
              line-height: 1.7;
              margin: 1.25em 0;
            }
            .news-content code {
              background: #f3f4f6;
              padding: 0.2em 0.45em;
              border-radius: 0.3em;
              font-size: 0.875em;
            }
            .news-content pre code {
              background: transparent;
              padding: 0;
              font-size: inherit;
            }
            .news-content img {
              max-width: 100%;
              height: auto;
              border-radius: 0.75em;
              margin: 1.5em auto;
              display: block;
            }
            .news-content a {
              color: #2563eb;
              text-decoration: underline;
              text-underline-offset: 2px;
            }
            .news-content a:hover {
              color: #1d4ed8;
            }
            .news-content hr {
              border: none;
              border-top: 2px solid #e5e7eb;
              margin: 2em 0;
            }
            .news-content table {
              border-collapse: collapse;
              width: 100%;
              margin: 1.5em 0;
              font-size: 0.95em;
            }
            .news-content thead {
              background: #f3f4f6;
            }
            .news-content th,
            .news-content td {
              border: 1px solid #d1d5db;
              padding: 0.75em 1em;
              text-align: left;
              line-height: 1.6;
            }
            .news-content th {
              font-weight: 600;
              color: #111827;
            }
            .news-content strong,
            .news-content b {
              font-weight: 700;
              color: #111827;
            }
            /* Override inline styles from pasted content that break spacing */
            .news-content [style*="margin-top: 0px"] {
              margin-top: 0.75em !important;
            }
            .news-content h2[style*="margin-top: 0px"],
            .news-content h3[style*="margin-top: 0px"] {
              margin-top: 1.5em !important;
            }
            .news-content [style*="line-height: 1.15"] {
              line-height: 1.8 !important;
            }
            .news-content div > h2:first-child,
            .news-content div > h3:first-child {
              margin-top: 1.5em;
            }
          `}</style>

          {/* Tags */}
          {news.tags && (
            <div className="flex items-center gap-3 mb-10 pb-8 border-b">
              <Tag className="w-5 h-5 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {news.tags.split(",").map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Bài viết liên quan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="h-36 overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(item.published_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
