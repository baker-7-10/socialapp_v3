export interface User {
  id: string;
  email?: string;
  username: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  website?: string | null;
  pronouns?: string | null;
  gender?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
  followedAt?: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId?: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  replies?: Comment[];
  reactions?: CommentReaction[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
