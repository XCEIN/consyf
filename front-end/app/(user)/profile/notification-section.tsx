"use client";

import ImageIcon from "@/components/shared/image-icon";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { API_URL } from "@/constants/api.const";

type ProjectStatus = "uploaded" | "failed" | "success";
interface Notification {
  id: number;
  type: 'post_uploaded' | 'post_approved' | 'post_rejected';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  post_title?: string;
}

// Map notification type to icon status
function getIconStatus(type: string): ProjectStatus {
  if (type === 'post_uploaded') return 'uploaded';
  if (type === 'post_approved') return 'success';
  if (type === 'post_rejected') return 'failed';
  return 'uploaded';
}

// Group notifications by date
function groupNotificationsByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayNotifs: Notification[] = [];
  const yesterdayNotifs: Notification[] = [];
  const olderNotifs: Notification[] = [];
  
  notifications.forEach(notif => {
    const notifDate = new Date(notif.created_at);
    notifDate.setHours(0, 0, 0, 0);
    
    if (notifDate.getTime() === today.getTime()) {
      todayNotifs.push(notif);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      yesterdayNotifs.push(notif);
    } else {
      olderNotifs.push(notif);
    }
  });
  
  return { todayNotifs, yesterdayNotifs, olderNotifs };
}

export default function NotificationSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

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
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải thông báo...</div>
      </div>
    );
  }

  const { todayNotifs, yesterdayNotifs, olderNotifs } = groupNotificationsByDate(notifications);
  if (notifications.length === 0) {
    return (
      <div className={cn("flex flex-col gap-6")}>
        <div>
          <h1 className={cn("text-2xl font-medium text-app-neutral-black")}>
            Thông báo
          </h1>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có thông báo nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div>
        <h1 className={cn("text-2xl font-medium text-app-neutral-black")}>
          Thông báo
        </h1>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-app-neutral-gray1">Chưa xem ({unreadCount})</h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-app-blue text-sm hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
      
      {/* Today's notifications */}
      {todayNotifs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm text-app-neutral-gray1">Hôm nay</h3>
          {todayNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markAsRead(item.id)}
              className={cn(
                "p-4 flex items-start gap-3 rounded-[12px] cursor-pointer transition-colors",
                "border shadow hover:bg-gray-50",
                { "bg-blue-50 hover:bg-blue-100": !item.is_read }
              )}
            >
              <ImageIcon src={`notification/${getIconStatus(item.type)}.svg`} size={38} />
              <div className="flex-1">
                <p className="text-app-neutral-gray1 font-semibold text-sm">{item.title}</p>
                <p className="text-app-neutral-gray1 text-sm">{item.content}</p>
                <p className="text-app-neutral-gray2 text-xs mt-1">
                  {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!item.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Yesterday's notifications */}
      {yesterdayNotifs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm text-app-neutral-gray1">Ngày hôm qua</h3>
          {yesterdayNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markAsRead(item.id)}
              className={cn(
                "p-4 flex items-start gap-3 rounded-[12px] cursor-pointer transition-colors",
                "border shadow hover:bg-gray-50",
                { "bg-blue-50 hover:bg-blue-100": !item.is_read }
              )}
            >
              <ImageIcon src={`notification/${getIconStatus(item.type)}.svg`} size={38} />
              <div className="flex-1">
                <p className="text-app-neutral-gray1 font-semibold text-sm">{item.title}</p>
                <p className="text-app-neutral-gray1 text-sm">{item.content}</p>
                <p className="text-app-neutral-gray2 text-xs mt-1">
                  {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!item.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Older notifications */}
      {olderNotifs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm text-app-neutral-gray1">Trước đó</h3>
          {olderNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markAsRead(item.id)}
              className={cn(
                "p-4 flex items-start gap-3 rounded-[12px] cursor-pointer transition-colors",
                "border shadow hover:bg-gray-50",
                { "bg-blue-50 hover:bg-blue-100": !item.is_read }
              )}
            >
              <ImageIcon src={`notification/${getIconStatus(item.type)}.svg`} size={38} />
              <div className="flex-1">
                <p className="text-app-neutral-gray1 font-semibold text-sm">{item.title}</p>
                <p className="text-app-neutral-gray1 text-sm">{item.content}</p>
                <p className="text-app-neutral-gray2 text-xs mt-1">
                  {new Date(item.created_at).toLocaleDateString('vi-VN')} - {new Date(item.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!item.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
