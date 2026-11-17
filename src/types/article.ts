// Scientific disciplines available for categorization and filtering
export type ScienceField =
  | 'Astronomia'
  | 'Biologia'
  | 'Fizyka'
  | 'Informatyka'
  | 'Chemia'
  | 'Medycyna';

// Structure of a single comment under an article
export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string; // ISO date string
}

// Main article entity stored in Pinia and localStorage
export interface Article {
  id: string;
  title: string;
  author: string;
  field: ScienceField;
  content: string;
  imageUrl?: string; // Optional external image URL
  createdAt: string; // ISO date string
  likes: number;
  isLiked: boolean; // Tracks if current user liked the post
  isSaved: boolean; // Tracks if article is bookmarked
  comments: Comment[];
}

// Payload used when creating or updating an article
export interface ArticlePayload {
  title: string;
  author: string;
  field: ScienceField;
  content: string;
  imageUrl?: string;
}

// User profile displayed in the left sidebar card
export interface UserProfile {
  name: string;
  title: string;
  institution: string;
  bio: string;
  avatarUrl: string;
}