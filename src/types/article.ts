// Scientific disciplines available for categorization and filtering
export type ScienceField =
  | 'Astronomia'
  | 'Biologia'
  | 'Fizyka'
  | 'Informatyka'
  | 'Chemia'
  | 'Medycyna';

// Academic publication formats
export type PublicationType =
  | 'Artykuł badawczy'
  | 'Przegląd'
  | 'Preprint'
  | 'Notatka badawcza';

// Feed sorting options
export type SortOption = 'newest' | 'popular' | 'discussed';

// UI color theme
export type ThemeMode = 'light' | 'dark';

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
  publicationType: PublicationType;
  tags: string[];
  content: string;
  imageUrl?: string; // Optional external image URL
  createdAt: string; // ISO date string
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
}

// Payload used when creating or updating an article
export interface ArticlePayload {
  title: string;
  author: string;
  field: ScienceField;
  publicationType: PublicationType;
  tags: string[];
  content: string;
  imageUrl?: string;
}

// Researcher profile displayed in the left sidebar card
export interface UserProfile {
  name: string;
  title: string;
  institution: string;
  bio: string;
  avatarUrl: string;
}