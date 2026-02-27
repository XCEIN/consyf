"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, useEffect, useState } from "react";
import NavLink from "@/components/shared/nav-link";
import Button from "@/components/commons/button";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Bell, X } from "lucide-react";
import { API_URL } from "@/constants/api.const";

interface Notification {
  id: number;
  type: 'post_uploaded' | 'post_approved' | 'post_rejected';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NavItem {
  label: string;
  href: string;
}
export const navItems: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Về chúng tôi", href: "/about-us" },
  { label: "Tin tức", href: "/news" },
  { label: "Bảng giá", href: "/price-list" },
  { label: "Khuyến mãi nhà đầu tư", href: "/promotion" },
];

export default function UserHeader({
  className,
  ...props
}: ComponentProps<"header">) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Get user info from API or localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name);
        setIsAdmin(user.role === 'admin');
      }
      
      // Fetch unread notification count
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/notifications`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      
      fetchNotifications();
      
      // Refresh notification count every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Close menus when clicking outside
    const handleClickOutside = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
      if (showNotifications) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <header className={cn("", className)} {...props}>
      <div
        className={cn(
          "container mx-auto",
          "flex items-center justify-between h-20"
        )}
      >
        <div className={cn("flex items-center gap-8")}>
          {/* Logo  */}
          <Link href={"/"} className={cn("w-[42px] h-8")}>
            <Image
              alt="logo"
              src={"/images/icons/logo_trans_1.svg"}
              width={42}
              height={32}
              priority
            />
          </Link>
          {/* Nav  */}
          <nav className={cn("flex items-center gap-8 text-app-neutral-gray1")}>
            {navItems.map(({ href, label }) => {
              return (
                <NavLink
                  key={href}
                  to={href}
                  classNameEffect={(isActive) =>
                    cn("font-semibold", {
                      "": isActive,
                    })
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        {/* Actions button */}
        {!isLoggedIn ? (
          <div className={cn("flex items-center gap-3")}>
            <Link href={"/sign-up"} className="cursor-pointer">
              <Button
                variant={"ghost"}
                className="cursor-pointer text-app-neutral-gray1"
              >
                Đăng ký
              </Button>
            </Link>
            <Link href={"/sign-in"} className="cursor-pointer">
              <Button
                className={cn(
                  "bg-primary-bold hover:bg-primary-bold/90 cursor-pointer"
                )}
              >
                Đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <div className={cn("flex items-center gap-4 relative")}>
            {/* Notifications */}
            <div className="relative">
              <Button 
                variant={"ghost"} 
                size={"icon"} 
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Popup */}
              {showNotifications && (
                <div 
                  className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[500px] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Chưa có thông báo nào</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.slice(0, 10).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.is_read) markAsRead(notif.id);
                            }}
                            className={cn(
                              "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                              { "bg-blue-50": !notif.is_read }
                            )}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {notif.type === 'post_approved' && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                                {notif.type === 'post_rejected' && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                )}
                                {notif.type === 'post_uploaded' && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                  {notif.title}
                                </p>
                                <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                                  {notif.content}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(notif.created_at).toLocaleDateString('vi-VN')} - {new Date(notif.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notif.is_read && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t bg-gray-50">
                      <Link
                        href="/profile?tab=notification"
                        className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant={"ghost"}
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{userName || "User"}</span>
              </Button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={"/profile"}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Trang cá nhân</span>
                    </div>
                  </Link>
                  {isAdmin && (
                    <Link
                      href={"/admin"}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Quản trị</span>
                      </div>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
