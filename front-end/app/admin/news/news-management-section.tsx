"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/commons/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MoreVertical,
  Calendar,
  User,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/constants/api.const";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  category: string;
  tags: string;
  published: boolean;
  featured: boolean;
  views: number;
  author_name: string;
  created_at: string;
  published_at: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type StatusFilter = "all" | "published" | "draft";

export default function NewsManagementSection() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; newsId: number | null }>({
    open: false,
    newsId: null,
  });

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error("No auth token found");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/news/admin/all?${params}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setNews(response.data.news);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Fetch news error:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchNews();
  };

  const handleTogglePublish = async (newsId: number, currentStatus: boolean) => {
    try {
      const authToken = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/news/${newsId}`,
        { published: !currentStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      fetchNews();
    } catch (error) {
      console.error("Toggle publish error:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleToggleFeatured = async (newsId: number, currentStatus: boolean) => {
    try {
      const authToken = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/news/${newsId}`,
        { featured: !currentStatus },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      fetchNews();
    } catch (error) {
      console.error("Toggle featured error:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.newsId) return;
    try {
      const authToken = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/news/${deleteModal.newsId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setDeleteModal({ open: false, newsId: null });
      fetchNews();
    } catch (error) {
      console.error("Delete news error:", error);
      alert("Có lỗi xảy ra khi xóa bài viết");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-10 lg:gap-12 py-12">
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tổng cộng {pagination.total} bài viết
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/admin/news/categories")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
          >
            Quản lý danh mục
          </Button>
          <Button
            onClick={() => router.push("/admin/news/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm bài viết
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(["all", "published", "draft"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {status === "all" && "Tất cả"}
                {status === "published" && "Đã xuất bản"}
                {status === "draft" && "Bản nháp"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có bài viết nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Bài viết
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Lượt xem
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate max-w-[300px]">
                              {item.title}
                            </h3>
                            {item.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            /news/{item.slug}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            <span>{item.author_name || "Admin"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {item.category || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(item.id, item.published)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium",
                          item.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        )}
                      >
                        {item.published ? (
                          <>
                            <Eye className="w-4 h-4" />
                            Công khai
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Bản nháp
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleFeatured(item.id, item.featured)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            item.featured
                              ? "text-yellow-600 bg-yellow-50"
                              : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                          )}
                          title={item.featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                        >
                          <Star className="w-5 h-5" />
                        </button>
                        <a
                          href={`/news/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem trước"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => router.push(`/admin/news/edit/${item.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, newsId: item.id })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Trước
              </Button>
              <Button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setDeleteModal({ open: false, newsId: null })}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Hủy
              </Button>
              <Button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
