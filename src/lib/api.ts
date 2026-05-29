import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
  }
  return 'Something went wrong';
};

// Posts API
export const postsApi = {
  create: (data: { content: string; imageUrl?: string; videoUrl?: string }) =>
    api.post('/posts', data),

  list: (limit = 10, page = 1) =>
    api.get('/posts', { params: { limit, page } }),

  get: (id: string) => api.get(`/posts/${id}`),

  update: (id: string, data: Partial<{ content: string; imageUrl: string; videoUrl: string }>) =>
    api.patch(`/posts/${id}`, data),

  delete: (id: string) => api.delete(`/posts/${id}`),
};

// Comments API
export const commentsApi = {
  list: (postId: string, limit = 20, page = 1) =>
    api.get(`/posts/${postId}/comments`, { params: { limit, page } }),

  create: (postId: string, data: { content: string; parentId?: string }) =>
    api.post(`/posts/${postId}/comments`, data),

  delete: (commentId: string) => api.delete(`/comments/${commentId}`),

  react: (commentId: string, emoji: string) =>
    api.post(`/comments/${commentId}/reactions`, { emoji }),

  unreact: (commentId: string, emoji: string) =>
    api.delete(`/comments/${commentId}/reactions`, { data: { emoji } }),

  getReactions: (commentId: string) => api.get(`/comments/${commentId}/reactions`),
};
