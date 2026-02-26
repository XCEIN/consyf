"use client";

import Image from "next/image";
import Link from "next/link";
import ImageIcon from "../image-icon";

interface PostCardProps {
  title: string;
  excerpt: string;
  slug: string;
  thumbnail: string | null;
  category: string;
  author_name?: string;
  published_at: string;
}

export default function PostCard({
  title,
  excerpt,
  slug,
  thumbnail,
  category,
  author_name,
  published_at,
}: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Link href={`/news/${slug}`} className="group flex flex-col gap-5">
      <div className="w-full h-60 overflow-hidden border-[0.5px] rounded-2xl shadow-xs">
        {thumbnail ? (
          <img
            alt={title}
            src={thumbnail}
            className="w-full h-full object-cover bg-primary-bold/50 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Không có ảnh</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {category && (
            <div>
              <span className="text-sm font-semibold text-purple-800">
                {category}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                {title}
              </h1>
              <div className="min-w-6 cursor-pointer">
                <ImageIcon src="/arrow_top_right.svg" size={24} />
              </div>
            </div>
            {excerpt && (
              <p className="text-app-neutral-gray3 text-ellipsis line-clamp-2">
                {excerpt}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {(author_name || "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">{author_name || "Admin"}</h2>
            <p className="text-sm font-normal text-app-neutral-gray3">
              {formatDate(published_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
