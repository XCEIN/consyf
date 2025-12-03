const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface Promotion {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  category_id?: number;
  category_name?: string;
  discount_percent?: number;
  discount_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

class PromotionService {
  async getAll(page: number = 1, limit: number = 12, categoryId?: number) {
    let url = `${API_URL}/api/promotions?page=${page}&limit=${limit}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get promotions');
    }

    return await response.json();
  }

  async getBySlug(slug: string): Promise<Promotion> {
    const response = await fetch(`${API_URL}/api/promotions/${slug}`);

    if (!response.ok) {
      throw new Error('Failed to get promotion');
    }

    const data = await response.json();
    return data.promotion;
  }

  async getCategories(): Promise<PromotionCategory[]> {
    const response = await fetch(`${API_URL}/api/promotions/categories/all`);

    if (!response.ok) {
      throw new Error('Failed to get categories');
    }

    const data = await response.json();
    return data.categories;
  }

  async create(data: Partial<Promotion>): Promise<number> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create promotion');
    }

    const result = await response.json();
    return result.promotionId;
  }

  async createCategory(data: Partial<PromotionCategory>): Promise<number> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/promotions/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create category');
    }

    const result = await response.json();
    return result.categoryId;
  }
}

export default new PromotionService();
