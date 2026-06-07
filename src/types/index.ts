export interface StaffUser {
  _id?: string;
  name: string;
  email?: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
  isActive: boolean;
  mustChangePassword: boolean;
  createdBy?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Article {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  categoryId: string;
  authorId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';
  submittedForReviewAt?: Date;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
}

export interface SiteSetting {
  _id?: string;
  key: string;
  value: string;
}

export interface SystemLog {
  _id?: string;
  action: string;
  userId?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface ReaderProfile {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  followedCategories: string[];
  savedArticles: string[];
  notificationEnabled: boolean;
  pushSubscription?: object;
}

export interface Comment {
  commentId: string;
  articleId: string;
  articleTitle: string;
  authorUid: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  parentCommentId?: string;
  createdAt: Date;
  ipAddress?: string;
}

export interface Notification {
  notificationId: string;
  recipientUid: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface SessionData {
  staffUser?: {
    id: string;
    name: string;
    email?: string;
    role: string;
    mustChangePassword: boolean;
  };
}
