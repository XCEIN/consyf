"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/constants/api.const";

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'buy' | 'sell';
  budget: number | null;
  location: string | null;
  tags: string | null;
  post_image?: string;
  description_images?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

type FilterType = 'all' | 'approved' | 'pending';

export default function PostsList() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_URL}/api/posts/user/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filter posts based on selected filter
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'approved') return post.status === 'approved';
    if (filter === 'pending') return post.status === 'pending';
    return true;
  });

  // Count posts by status
  const approvedCount = posts.filter(p => p.status === 'approved').length;
  const pendingCount = posts.filter(p => p.status === 'pending').length;

  const handleEdit = (post: Post) => {
    // Navigate to "Thông tin dự án" tab with edit mode
    // Store post data in localStorage for ProjectSection to load
    localStorage.setItem('editPost', JSON.stringify(post));
    router.push('/profile?tab=project&edit=' + post.id);
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Reload posts list
        setPosts(posts.filter(p => p.id !== postId));
        alert('Xóa dự án thành công!');
      } else {
        alert('Xóa dự án thất bại!');
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert('Lỗi khi xóa dự án!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có dự án nào. Hãy tạo dự án đầu tiên của bạn!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-4">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            filter === 'all'
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Tất cả ({posts.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            filter === 'approved'
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Đã duyệt ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            filter === 'pending'
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          Chờ duyệt ({pendingCount})
        </button>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>
            {filter === 'approved' && 'Chưa có dự án nào được duyệt.'}
            {filter === 'pending' && 'Chưa có dự án nào đang chờ duyệt.'}
            {filter === 'all' && 'Chưa có dự án nào.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
        <div
          key={post.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start gap-4">
            {/* Post Image */}
            {post.post_image && (
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={post.post_image}
                  alt={post.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            {/* Post Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-lg truncate">{post.title}</h4>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                    {
                      "bg-yellow-100 text-yellow-800": post.status === "pending",
                      "bg-green-100 text-green-800": post.status === "approved",
                      "bg-red-100 text-red-800": post.status === "rejected",
                    }
                  )}
                >
                  {post.status === "pending" && "Chờ duyệt"}
                  {post.status === "approved" && "Đã duyệt"}
                  {post.status === "rejected" && "Từ chối"}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {post.description}
              </p>
              
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  {post.location || "Không xác định"}
                </span>
                <span className="flex items-center gap-1">
                  <span>💰</span>
                  {post.budget ? `${post.budget.toLocaleString()} VND` : "Thương lượng"}
                </span>
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  {new Date(post.created_at).toLocaleDateString("vi-VN")}
                </span>
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                  {post.type === 'buy' ? '🛒 Cần mua' : '🏪 Cung cấp'}
                </span>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  );
}
