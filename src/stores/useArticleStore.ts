import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type {
  Article,
  ArticlePayload,
  ScienceField,
  SortOption,
  ThemeMode,
  UserProfile,
} from '../types/article';
import { INITIAL_ARTICLES } from '../data/mockArticles';

const STORAGE_KEY = 'sciencenet_articles_v2';
const PROFILE_KEY = 'sciencenet_profile_v1';
const THEME_KEY = 'sciencenet_theme_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Elisey Avvakumov',
  title: 'Student — Projektowanie gier',
  institution: 'Uniwersytet WSB Merito w Gdańsku',
  bio: 'Zajmuję się projektowaniem i programowaniem gier komputerowych, mechaniką rozgrywki oraz interaktywnymi symulacjami.',
  avatarUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
};

export const useArticleStore = defineStore('articles', () => {
  // --- Theme Management ---
  const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  const theme = ref<ThemeMode>(savedTheme === 'dark' ? 'dark' : 'light');

  const applyTheme = (mode: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(THEME_KEY, mode);
  };

  applyTheme(theme.value);

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyTheme(theme.value);
  };

  // --- User Profile ---
  const loadProfile = (): UserProfile => {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  };

  const currentUser = ref<UserProfile>(loadProfile());

  const updateProfile = (updated: Partial<UserProfile>) => {
    currentUser.value = { ...currentUser.value, ...updated };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(currentUser.value));
  };

  // --- Articles State ---
  const loadArticles = (): Article[] => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData !== null) {
      try {
        const parsed = JSON.parse(rawData) as Article[];
        // Ensure backward compatibility with older entries
        return parsed.map((item) => ({
          ...item,
          publicationType: item.publicationType || 'Artykuł badawczy',
          tags: Array.isArray(item.tags) ? item.tags : [],
        }));
      } catch (e) {
        console.error('Failed to parse articles from localStorage:', e);
        return [...INITIAL_ARTICLES];
      }
    }
    return [...INITIAL_ARTICLES];
  };

  const articles = ref<Article[]>(loadArticles());

  // --- Filter, Search & Sort States ---
  const searchQuery = ref<string>('');
  const selectedField = ref<ScienceField | 'ALL'>('ALL');
  const selectedTag = ref<string | null>(null);
  const onlyMine = ref<boolean>(false);
  const sortBy = ref<SortOption>('newest');

  // Active article for full-screen Reader Modal
  const activeArticle = ref<Article | null>(null);

  watch(
    articles,
    (newArticles) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newArticles));
    },
    { deep: true }
  );

  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles.value));
  }

  // --- Computed Selectors ---
  const filteredArticles = computed<Article[]>(() => {
    const query = searchQuery.value.trim().toLowerCase();

    const filtered = articles.value.filter((article) => {
      const matchesField =
        selectedField.value === 'ALL' || article.field === selectedField.value;

      const matchesTag =
        !selectedTag.value ||
        article.tags.some((t) => t.toLowerCase() === selectedTag.value?.toLowerCase());

      const matchesAuthor =
        !onlyMine.value ||
        article.author.toLowerCase() === currentUser.value.name.trim().toLowerCase();

      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.tags.some((t) => t.toLowerCase().includes(query));

      return matchesField && matchesTag && matchesAuthor && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy.value === 'popular') {
        return b.likes - a.likes;
      }
      if (sortBy.value === 'discussed') {
        return b.comments.length - a.comments.length;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  const topLikedArticles = computed<Article[]>(() => {
    return [...articles.value].sort((a, b) => b.likes - a.likes).slice(0, 3);
  });

  const savedArticles = computed<Article[]>(() => {
    return [...articles.value]
      .filter((article) => article.isSaved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Top tags across all publications for quick filtering
  const popularTags = computed<{ name: string; count: number }[]>(() => {
    const counts = new Map<string, number>();
    for (const article of articles.value) {
      for (const rawTag of article.tags) {
        const tag = rawTag.trim().toLowerCase();
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });

  // --- Actions ---
  const addArticle = (payload: ArticlePayload): void => {
    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title: payload.title.trim(),
      author: payload.author.trim() || currentUser.value.name,
      field: payload.field,
      publicationType: payload.publicationType,
      tags: payload.tags,
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
    target.publicationType = payload.publicationType;
    target.tags = payload.tags;
    target.content = payload.content.trim();
    target.imageUrl = payload.imageUrl?.trim() || undefined;
  };

  const deleteArticle = (id: string): void => {
    articles.value = articles.value.filter((a) => a.id !== id);
    if (activeArticle.value?.id === id) {
      activeArticle.value = null;
    }
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

  const selectTag = (tag: string | null): void => {
    selectedTag.value = selectedTag.value === tag ? null : tag;
  };

  const resetFilters = (): void => {
    searchQuery.value = '';
    selectedField.value = 'ALL';
    selectedTag.value = null;
    onlyMine.value = false;
    sortBy.value = 'newest';
  };

  const resetDemoData = (): void => {
    articles.value = [...INITIAL_ARTICLES];
    resetFilters();
  };

  return {
    theme,
    toggleTheme,
    currentUser,
    updateProfile,
    articles,
    searchQuery,
    selectedField,
    selectedTag,
    onlyMine,
    sortBy,
    activeArticle,
    filteredArticles,
    topLikedArticles,
    savedArticles,
    popularTags,
    addArticle,
    updateArticle,
    deleteArticle,
    toggleLike,
    toggleSave,
    addComment,
    selectTag,
    resetFilters,
    resetDemoData,
  };
});