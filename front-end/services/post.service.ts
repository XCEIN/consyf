import http from "@/lib/http";

import { API_URL } from "@/constants/api.const";
const BASE = API_URL;

export type PostType = 'buy' | 'sell';
export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface PostInput {
  company_id: number;
  type: PostType;
  title: string;
  description: string;
  category: string;
  budget?: number;
  location?: string;
  tags?: string[];
}

export interface Post {
  id: number;
  company_id: number;
  type: PostType;
  title: string;
  description: string;
  category: string;
  budget: number | null;
  location: string | null;
  tags: string | null;
  status?: PostStatus;
  created_at: string;
  company_name?: string;
  company_logo?: string;
  user_name?: string;
  user_avatar?: string;
  account_type?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function createPost(input: PostInput) {
  return http.post<{ id: number }>(`/api/posts`, input, { baseURL: BASE });
}

export async function listPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: PostType;
  location?: string;
  sort?: 'newest' | 'oldest';
  minBudget?: number;
  maxBudget?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.location) queryParams.append('location', params.location);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.minBudget) queryParams.append('minBudget', params.minBudget.toString());
  if (params?.maxBudget) queryParams.append('maxBudget', params.maxBudget.toString());

  return http.get<PostsResponse>(`/api/posts?${queryParams.toString()}`, { baseURL: BASE });
}

export async function getPost(id: number) {
  return http.get<Post>(`/api/posts/${id}`, { baseURL: BASE });
}

export async function listMatches() {
  return http.get<Array<{buy_id:number, sell_id:number, score:number}>>(`/api/match/posts`, { baseURL: BASE });
}

// Admin functions
export async function getAdminPosts(params?: {
  page?: number;
  limit?: number;
  status?: PostStatus | 'all';
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);

  return http.get<PostsResponse>(`/api/posts/admin/all?${queryParams.toString()}`, { 
    baseURL: BASE,
    skipAuth: false 
  });
}

export async function updatePostStatus(postId: number, status: PostStatus) {
  return http.put<{ message: string }>(`/api/posts/${postId}/status`, { status }, { 
    baseURL: BASE,
    skipAuth: false 
  });
}
