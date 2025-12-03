"use client";

import ProjectCard from "@/components/shared/user/project-card";
import { cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Button from "@/components/commons/button";
import { listPosts, Post } from "@/services/post.service";

export default function ProjectSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [topic, setTopic] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await listPosts({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        category: topic || undefined,
        sort: sortBy as 'newest' | 'oldest',
        minBudget: priceFrom ? parseFloat(priceFrom) : undefined,
        maxBudget: priceTo ? parseFloat(priceTo) : undefined,
      });
      
      setPosts(response.posts || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const handleApplyFilter = () => {
    setCurrentPage(1); // Reset to first page when filtering
    loadPosts();
  };

  return (
    <div
      className={cn(
        "container mx-auto",
        "py-12",
        "flex flex-col gap-4 lg:gap-8"
      )}
    >
      {/* Title */}
      <h2 className="text-2xl lg:text-4xl font-semibold">Danh sách dự án</h2>

      {/* Filter section */}
      <div className={cn(
        "bg-white rounded-xl shadow-sm border p-4",
        "flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center"
      )}>
        {/* Tìm kiếm dự án */}
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
            )}
          />
        </div>

        {/* Chủ đề */}
        <div className="relative w-full lg:w-auto">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={cn(
              "w-full lg:min-w-[180px] px-4 py-2.5 pr-10 rounded-lg border border-gray-300 appearance-none bg-white",
              "focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent cursor-pointer"
            )}
          >
            <option value="">Tất cả danh mục</option>
            <option value="Công nghệ">Công nghệ</option>
            <option value="Nhân sự">Nhân sự</option>
            <option value="Văn phòng">Văn phòng</option>
            <option value="Marketing">Marketing</option>
            <option value="Tài chính">Tài chính</option>
            <option value="Pháp lý">Pháp lý</option>
            <option value="Dịch vụ khác">Dịch vụ khác</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Ngày đăng */}
        <div className="relative w-full lg:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={cn(
              "w-full lg:min-w-[200px] px-4 py-2.5 pr-10 rounded-lg border border-gray-300 appearance-none bg-white",
              "focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent cursor-pointer"
            )}
          >
            <option value="newest">Ngày đăng mới nhất</option>
            <option value="oldest">Ngày đăng cũ nhất</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Từ (giá) */}
        <div className="w-full lg:w-auto">
          <input
            type="number"
            placeholder="Từ"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            min="0"
            className={cn(
              "w-full lg:w-[120px] px-4 py-2.5 rounded-lg border border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
            )}
          />
        </div>

        {/* Đến (giá) */}
        <div className="w-full lg:w-auto">
          <input
            type="number"
            placeholder="Đến"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            min="0"
            className={cn(
              "w-full lg:w-[120px] px-4 py-2.5 rounded-lg border border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-app-blue focus:border-transparent"
            )}
          />
        </div>

        {/* Nút Áp dụng */}
        <Button
          onClick={handleApplyFilter}
          className={cn(
            "w-full lg:w-auto bg-app-blue hover:bg-app-blue/90 cursor-pointer",
            "px-6 py-2.5 font-medium"
          )}
        >
          Áp dụng
        </Button>
      </div>

      {/* Project list */}
      <div className="">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải dự án...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có dự án nào</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-10">
            {posts.map((post) => {
              return (
                <li key={post.id}>
                  <ProjectCard post={post} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {/* First page button */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300",
              "hover:bg-gray-50 transition-colors text-gray-600",
              { "opacity-50 cursor-not-allowed": currentPage === 1 }
            )}
            aria-label="Trang đầu"
          >
            <span className="text-lg">«</span>
          </button>

          {/* Previous page button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300",
              "hover:bg-gray-50 transition-colors text-gray-600",
              { "opacity-50 cursor-not-allowed": currentPage === 1 }
            )}
            aria-label="Trang trước"
          >
            <span className="text-lg">‹</span>
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + Math.max(1, currentPage - 2);
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg",
                  {
                    "bg-app-blue text-white font-medium": currentPage === page,
                    "border border-gray-300 hover:bg-gray-50 text-gray-700": currentPage !== page,
                  }
                )}
              >
                {page}
              </button>
            );
          })}

          {/* Next page button */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300",
              "hover:bg-gray-50 transition-colors text-gray-600",
              { "opacity-50 cursor-not-allowed": currentPage === totalPages }
            )}
            aria-label="Trang sau"
          >
            <span className="text-lg">›</span>
          </button>

          {/* Last page button */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300",
              "hover:bg-gray-50 transition-colors text-gray-600",
              { "opacity-50 cursor-not-allowed": currentPage === totalPages }
            )}
            aria-label="Trang cuối"
          >
            <span className="text-lg">»</span>
          </button>
        </div>
      )}
    </div>
  );
}
