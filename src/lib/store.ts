'use client';

import { create } from 'zustand';
import { User, Post, PaginatedResponse } from '@/types';
import { api, postsApi, getErrorMessage } from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoaded: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoaded: false,

  setAuth: (user, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoaded: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoaded: true });
  },

  loadFromStorage: () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));

// Posts Store
interface PostsState {
  posts: Post[];
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  fetchPosts: (page?: number, limit?: number) => Promise<void>;
  createPost: (content: string, imageUrl?: string, videoUrl?: string) => Promise<Post | null>;
  deletePost: (id: string) => Promise<boolean>;
  updatePost: (id: string, data: Partial<{ content: string; imageUrl: string; videoUrl: string }>) => Promise<Post | null>;
  setError: (error: string | null) => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  currentPage: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,

  fetchPosts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await postsApi.list(limit, page);
      const data = response.data as PaginatedResponse<Post>;
      set({
        posts: data.data,
        currentPage: data.meta.page,
        pageSize: data.meta.limit,
        total: data.meta.total,
        totalPages: data.meta.totalPages,
        isLoading: false,
      });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      set({ error: errorMsg, isLoading: false });
    }
  },

  createPost: async (content, imageUrl, videoUrl) => {
    set({ error: null });
    try {
      const response = await postsApi.create({ content, imageUrl, videoUrl });
      const newPost = response.data as Post;
      set((state) => ({
        posts: [newPost, ...state.posts],
        total: state.total + 1,
      }));
      return newPost;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      set({ error: errorMsg });
      return null;
    }
  },

  deletePost: async (id) => {
    set({ error: null });
    try {
      await postsApi.delete(id);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        total: state.total - 1,
      }));
      return true;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      set({ error: errorMsg });
      return false;
    }
  },

  updatePost: async (id, data) => {
    set({ error: null });
    try {
      const response = await postsApi.update(id, data);
      const updatedPost = response.data as Post;
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
      }));
      return updatedPost;
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      set({ error: errorMsg });
      return null;
    }
  },

  setError: (error) => set({ error }),
}));
