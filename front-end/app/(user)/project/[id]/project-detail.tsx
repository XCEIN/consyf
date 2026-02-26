"use client";

import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, MapPin, Globe, Mail, Phone, Building, User } from "lucide-react";
import ProjectCard from "@/components/shared/user/project-card";

interface PostDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'buy' | 'sell';
  budget: number | null;
  location: string | null;
  tags: string | null;
  created_at: string;
  status: string;
  company_name?: string;
  user_name?: string;
  user_avatar?: string;
  user_email?: string;
  user_phone?: string;
  account_type?: string;
  post_image?: string;
  description_images?: string;
}

const AccountTypeBadge = ({ type }: { type: string }) => {
  if (type === "organization") {
    return (
      <span className="px-3 py-1 rounded-full border border-blue-300 bg-blue-100 text-blue-700 text-sm font-medium">
        Tổ Chức
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full border border-green-300 bg-green-100 text-green-700 text-sm font-medium">
      Cá Nhân
    </span>
  );
};

const TypeBadge = ({ type }: { type: 'buy' | 'sell' }) => {
  if (type === "buy") {
    return (
      <span className="px-3 py-1.5 rounded-md border border-blue-500 bg-blue-500 text-white text-sm font-medium">
        Buyer Side
      </span>
    );
  }
  return (
    <span className="px-3 py-1.5 rounded-md border border-orange-500 bg-white text-orange-500 text-sm font-medium">
      Seller Side
    </span>
  );
};

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PostDetail[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/posts/${projectId}`
        );

        if (!response.ok) {
          throw new Error("Không tìm thấy dự án");
        }

        const data = await response.json();
        setPost(data.post || data);

        // Fetch related posts
        const relatedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/posts?category=${encodeURIComponent(data.post?.category || data.category)}&limit=4`
        );
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedPosts(
            (relatedData.posts || []).filter((p: PostDetail) => p.id !== parseInt(projectId)).slice(0, 4)
          );
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Không thể tải thông tin dự án");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [projectId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Không tìm thấy dự án"}
          </h1>
          <Link href="/">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Quay về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatBudget = (budget: number | null) => {
    if (!budget) return "Thỏa thuận";
    if (budget >= 1000000000) {
      return `${(budget / 1000000000).toFixed(0)} tỷ VNĐ`;
    }
    if (budget >= 1000000) {
      return `${(budget / 1000000).toFixed(0)} tr VNĐ`;
    }
    return `${budget.toLocaleString()} VNĐ`;
  };

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return tags.split(",").map((t) => t.trim());
    }
  };

  const parseDescriptionImages = (images: string | null | undefined): string[] => {
    if (!images) return [];
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  };

  const descImages = parseDescriptionImages(post.description_images);
  const tags = parseTags(post.tags);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-500">Trang chủ</Link>
            <span>/</span>
            <Link href="/#projects" className="hover:text-blue-500">{post.category}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[300px]">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                  {post.account_type === 'organization' && post.post_image ? (
                    <img src={post.post_image} alt="project" className="w-full h-full object-cover" />
                  ) : post.user_avatar ? (
                    <img src={post.user_avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Đăng bởi</p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {post.user_name || post.company_name || "Anonymous"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {post.type === 'buy' ? 'Đang tìm kiếm đối tác' : 'Đang cung cấp dịch vụ'}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                <TypeBadge type={post.type} />
                <TypeBadge type={post.type === 'buy' ? 'sell' : 'buy'} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-6">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-md">
                {post.category}
              </span>
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 md:p-8 border-b bg-gray-50">
            <div>
              <p className="text-sm text-gray-500 mb-1">Ngày đăng:</p>
              <p className="font-medium text-gray-900">
                {new Date(post.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Địa chỉ:</p>
              <p className="font-medium text-gray-900">
                {post.location || "Việt Nam"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Website:</p>
              <a href="#" className="font-medium text-blue-500 hover:underline">
                www.example.vn
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email:</p>
              <a href={`mailto:${post.user_email || ''}`} className="font-medium text-blue-500 hover:underline">
                {post.user_email || "contact@example.com"}
              </a>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả chi tiết</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {post.description}
            </div>

            {/* Description Images */}
            {descImages.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh dự án</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {descImages.map((img, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100 border"
                    >
                      <img
                        src={img}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget & Contact Section */}
          <div className="p-6 md:p-8 border-t bg-gradient-to-r from-blue-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-sm text-blue-600 mb-1">Vốn huy động</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {formatBudget(post.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">Đồng sáng Lập</p>
                  <p className="font-semibold text-gray-900">
                    Giám đốc công nghệ<br />
                    Giám đốc tài chính
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 mb-1">Đối tác</p>
                  <p className="font-semibold text-gray-900">
                    Đối tác chiến lược
                  </p>
                </div>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg">
                Liên hệ
              </Button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Dự án liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <ProjectCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
