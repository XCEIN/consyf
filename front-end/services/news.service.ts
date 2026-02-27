import { API_URL } from "@/constants/api.const";

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  author_id?: number;
  category?: string;
  tags?: string;
  views: number;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

class NewsService {
  async getAll(page: number = 1, limit: number = 12, category?: string) {
    let url = `${API_URL}/api/news?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get news');
    }

    return await response.json();
  }

  async getBySlug(slug: string): Promise<NewsArticle> {
    const response = await fetch(`${API_URL}/api/news/${slug}`);

    if (!response.ok) {
      throw new Error('Failed to get news article');
    }

    const data = await response.json();
    return data.news;
  }

  async create(data: Partial<NewsArticle>): Promise<number> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create news');
    }

    const result = await response.json();
    return result.newsId;
  }

  async update(id: number, data: Partial<NewsArticle>): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update news');
    }
  }

  async delete(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/news/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete news');
    }
  }
}

export default new NewsService();
