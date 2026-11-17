import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Article, ArticlePayload, ScienceField, UserProfile } from '../types/article';
import { INITIAL_ARTICLES } from '../data/mockArticles';

const STORAGE_KEY = 'sciencenet_articles_v1';

export const useArticleStore = defineStore('articles', () => {
  // Current researcher profile for the left sidebar
  const currentUser = ref<UserProfile>({
    name: 'dr Elisey Avvakumov',
    title: 'Badacz AI & Symulacji',
    institution: 'Uniwersytet WSB Merito w Gdańsku',
    bio: 'Zajmuję się sztuczną inteligencją, modelowaniem systemów złożonych oraz wizualizacją danych naukowych.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  });

  // Load initial state from localStorage or fallback to mock data on very first visit
  const loadArticles = (): Article[] => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData !== null) {
      try {
        return JSON.parse(rawData) as Article[];
      } catch (e) {
        console.error('Failed to parse articles from localStorage:', e);
        return [...INITIAL_ARTICLES];
      }
    }
    return [...INITIAL_ARTICLES];
  };

  const articles = ref<Article[]>(loadArticles());

  // Filter states
  const searchQuery = ref<string>('');
  const selectedField = ref<ScienceField | 'ALL'>('ALL');

  // Persist every change in articles deeply into localStorage
  watch(
    articles,
    (newArticles) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newArticles));
    },
    { deep: true }
  );

  // Save initial articles on first load so key exists in localStorage
  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value));
  }

  // Computed: Articles sorted from newest to oldest, filtered by search and science field
  const filteredArticles = computed<Article[]>(() => {
    return [...articles.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((article) => {
        const matchesField =
          selectedField.value === 'ALL' || article.field === selectedField.value;
        const matchesSearch = article.title
          .toLowerCase()
          .includes(searchQuery.value.trim().toLowerCase());
        return matchesField && matchesSearch;
      });
  });

  // Computed: Top 3 most liked articles for the right sidebar
  const topLikedArticles = computed<Article[]>(() => {
    return [...articles.value]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3);
  });

  // Computed: Bookmarked articles for the /saved subpage
  const savedArticles = computed<Article[]>(() => {
    return [...articles.value]
      .filter((article) => article.isSaved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Actions
  const addArticle = (payload: ArticlePayload): void => {
    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title: payload.title.trim(),
      author: payload.author.trim() || currentUser.value.name,
      field: payload.field,
      content: payload.content.trim(),
      imageUrl: payload.imageUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isSaved: false,
      comments: [],
    };
    articles.value.unshift(newArticle);
  };

  const updateArticle = (id: string, payload: ArticlePayload): void => {
    const target = articles.value.find((a) => a.id === id);
    if (!target) return;

    target.title = payload.title.trim();
    target.author = payload.author.trim() || target.author;
    target.field = payload.field;
    target.content = payload.content.trim();
    target.imageUrl = payload.imageUrl?.trim() || undefined;
  };

  const deleteArticle = (id: string): void => {
    articles.value = articles.value.filter((a) => a.id !== id);
  };

  const toggleLike = (id: string): void => {
    const target = articles.value.find((a) => a.id === id);
    if (!target) return;

    target.isLiked = !target.isLiked;
    target.likes += target.isLiked ? 1 : -1;
  };

  const toggleSave = (id: string): void => {
    const target = articles.value.find((a) => a.id === id);
    if (!target) return;

    target.isSaved = !target.isSaved;
  };

  const addComment = (articleId: string, text: string, author?: string): void => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const target = articles.value.find((a) => a.id === articleId);
    if (!target) return;

    target.comments.push({
      id: `com-${Date.now()}`,
      author: author?.trim() || currentUser.value.name,
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
  };

  // Helper to reset demo data if needed during testing
  const resetDemoData = (): void => {
    articles.value = [...INITIAL_ARTICLES];
  };

  return {
    currentUser,
    articles,
    searchQuery,
    selectedField,
    filteredArticles,
    topLikedArticles,
    savedArticles,
    addArticle,
    updateArticle,
    deleteArticle,
    toggleLike,
    toggleSave,
    addComment,
    resetDemoData,
  };
});