"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectManagementSection from "./project-management-section";
import { FileText, FolderKanban, Newspaper, ExternalLink } from "lucide-react";

type TabType = "projects" | "news";

const TabText: Record<TabType, string> = {
  projects: "Quản lý dự án",
  news: "Quản lý tin tức",
};

export default function AdminDashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/sign-in');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  return (
    <div className={cn("flex flex-col gap-10 lg:gap-12 py-12")}>
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b">
          <div className="flex items-center gap-4">
            <div className="w-[60px] h-[60px] relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:4000${user.avatar}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-500">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              <span className="px-3 py-1 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl inline-block mt-1">
                Quản trị viên
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="bg-white rounded-lg border p-4 space-y-2">
               
                <h3 className="text-sm font-semibold text-gray-500 px-3 mb-2">Dashboards</h3>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                    activeTab === "projects"
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <FolderKanban className="w-5 h-5" />
                  {TabText.projects}
                </button>
                <button
                  onClick={() => router.push("/admin/news")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                    "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Newspaper className="w-5 h-5" />
                  {TabText.news}
                  <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="min-h-[500px]">
              {activeTab === "projects" && <ProjectManagementSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
