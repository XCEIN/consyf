import { API_URL } from "@/constants/api.const";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  account_type?: string;
  role: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type?: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Project {
  id: number;
  company_id: number;
  type: 'buy' | 'sell';
  title: string;
  description: string;
  category: string;
  budget?: number;
  location?: string;
  tags?: string;
  company_name: string;
  company_logo?: string;
  created_at: string;
}

class ProfileService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {}; 
  }

  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    const data = await response.json();
    return data.user;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const result = await response.json();
    return result.user;
  }

  async getNotifications(page: number = 1, limit: number = 10) {
    const response = await fetch(
      `${API_URL}/api/profile/notifications?page=${page}&limit=${limit}`,
      {
        headers: {
          ...this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get notifications');
    }

    return await response.json();
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/profile/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          ...this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  }

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/profile/projects`, {
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get projects');
    }

    const data = await response.json();
    return data.projects;
  }
}

export default new ProfileService();
