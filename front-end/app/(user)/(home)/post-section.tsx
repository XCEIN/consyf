"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/shared/user/post-card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import axios from "axios";

interface FeaturedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  category: string;
  author_name?: string;
  published_at: string;
}

export default function PostSection() {
  const [posts, setPosts] = useState<FeaturedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/news?featured=true&limit=6"
        );
        setPosts(res.data.news || []);
      } catch (err) {
        console.error("Fetch featured posts error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPosts();
  }, []);

  // Don't render section if no featured posts
  if (!loading && posts.length === 0) return null;

  return (
    <div
      className={cn(
        "container mx-auto",
        "flex flex-col gap-16",
        "pb-12"
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] lg:text-5xl text-primary-bold font-medium">
          Bài viết
        </h1>
        <Link
          href="/news"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {loading ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="animate-pulse">
              <div className="w-full h-60 bg-gray-200 rounded-2xl mb-5" />
              <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard
                title={post.title}
                excerpt={post.excerpt}
                slug={post.slug}
                thumbnail={post.thumbnail}
                category={post.category}
                author_name={post.author_name}
                published_at={post.published_at}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
