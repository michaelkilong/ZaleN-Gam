import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  categoryId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';
  submittedForReviewAt?: Date;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

const ArticleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  featuredImage: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'StaffUser', required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'PUBLISHED'], 
    default: 'DRAFT' 
  },
  submittedForReviewAt: { type: Date },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ categoryId: 1, status: 1 });

export const Article = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
