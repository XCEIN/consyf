"use client";

import { useEffect, useState } from "react";
import { getAdminPosts, updatePostStatus, Post } from "@/services/post.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function ProjectManagementSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, [statusFilter, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await getAdminPosts({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setPosts(response.posts);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading admin posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (postId: number, newStatus: 'approved' | 'rejected') => {
    try {
      await updatePostStatus(postId, newStatus);
      alert(`Đã ${newStatus === 'approved' ? 'duyệt' : 'từ chối'} bài đăng thành công`);
      loadPosts();
      setSelectedPost(null);
    } catch (error) {
      console.error('Error updating post status:', error);
      alert('Lỗi khi cập nhật trạng thái bài đăng');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Được Duyệt</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Từ chối</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'buy' ? (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Đầu tư</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Huy động</span>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quản lý dự án</h2>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('pending');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Chờ duyệt
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('approved');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Đã duyệt
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('rejected');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Từ chối
          </Button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">Đang tải...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Không có bài đăng nào</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Người dùng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tên dự án</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Chủ đề</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày gửi</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPosts.map((post) => (
                <tr 
                  key={post.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {post.user_avatar ? (
                          <img
                            src={post.user_avatar.startsWith('http') ? post.user_avatar : `http://localhost:4000${post.user_avatar}`}
                            alt={post.user_name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                            {post.user_name?.charAt(0).toUpperCase() || post.company_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{post.company_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 truncate">{post.user_name || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{post.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {getTypeBadge(post.type)}
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {post.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(post.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Xem thêm
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        >
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedPost.title}</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Thông Tin Liên Hệ</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Địa điểm:</span>
                    <p className="font-medium">{selectedPost.location || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-blue-600">{selectedPost.company_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Xây Dựng Thư Viện Số Cho Cộng Đồng</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">{selectedPost.description}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Thông Tin Dự Án</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Loại hình:</span>
                    <p className="font-medium">{selectedPost.type === 'buy' ? 'Đầu tư' : 'Huy động'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vốn dự án:</span>
                    <p className="font-medium text-blue-600">
                      {selectedPost.budget ? `${selectedPost.budget.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Danh mục:</span>
                    <p className="font-medium">{selectedPost.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <div className="mt-1">{getStatusBadge(selectedPost.status)}</div>
                  </div>
                </div>
              </div>

              {selectedPost.tags && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPost(null)}
              >
                Hủy
              </Button>
              {selectedPost.status !== 'rejected' && (
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedPost.id, 'rejected')}
                >
                  Từ chối
                </Button>
              )}
              {selectedPost.status !== 'approved' && (
                <Button
                  onClick={() => handleUpdateStatus(selectedPost.id, 'approved')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Duyệt
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
