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
import { INITIAL_ARTICLES, SCIENCE_FIELDS } from '../data/mockArticles';

const STORAGE_KEY = 'sciencenet_articles_v2';
const PROFILE_KEY = 'sciencenet_profile_v1';
const THEME_KEY = 'sciencenet_theme_v1';

export interface ToastItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Elisey Avvakumov',
  title: 'Student — Projektowanie gier',
  institution: 'Uniwersytet WSB Merito w Gdańsku',
  bio: 'Zajmuję się projektowaniem i programowaniem gier komputerowych, mechaniką rozgrywki oraz interaktywnymi symulacjami.',
  avatarUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  isVerified: true,
};

const computeScientometrics = (list: Article[]) => {
  const scores = list
    .map((a) => a.likes + a.comments.length * 2)
    .sort((a, b) => b - a);

  const totalImpact = scores.reduce((sum, val) => sum + val, 0);

  let hIndex = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] >= i + 1) {
      hIndex = i + 1;
    } else {
      break;
    }
  }

  return {
    publications: list.length,
    citations: totalImpact,
    hIndex,
  };
};

export const useArticleStore = defineStore('articles', () => {
  // --- Toast Notifications ---
  const toasts = ref<ToastItem[]>([]);

  const dismissToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const notify = (
    message: string,
    options?: { actionLabel?: string; onAction?: () => void; duration?: number }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    toasts.value.push({
      id,
      message,
      actionLabel: options?.actionLabel,
      onAction: options?.onAction,
    });

    setTimeout(() => {
      dismissToast(id);
    }, options?.duration ?? 4000);
  };

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
    notify(theme.value === 'dark' ? 'Włączono motyw ciemny' : 'Włączono motyw jasny', {
      duration: 2200,
    });
  };

  // --- User Profile ---
  const loadProfile = (): UserProfile => {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    try {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        isVerified: typeof parsed.isVerified === 'boolean' ? parsed.isVerified : true,
      };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  };

  const currentUser = ref<UserProfile>(loadProfile());

  // --- Articles State ---
  const loadArticles = (): Article[] => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    const activeName = currentUser.value.name.trim().toLowerCase();
    const defaultName = DEFAULT_PROFILE.name.trim().toLowerCase();

    if (rawData !== null) {
      try {
        const parsed = JSON.parse(rawData) as Article[];
        return parsed.map((item) => {
          const itemAuthor = (item.author || '').trim().toLowerCase();
          const detectedOwn =
            item.isOwn === true ||
            itemAuthor === activeName ||
            itemAuthor === defaultName;

          return {
            ...item,
            isOwn: detectedOwn,
            isVerifiedAuthor: detectedOwn
              ? currentUser.value.isVerified
              : item.isVerifiedAuthor ??
                (itemAuthor.startsWith('dr') || itemAuthor.startsWith('prof')),
            author: detectedOwn ? currentUser.value.name : item.author,
            publicationType: item.publicationType || 'Artykuł badawczy',
            tags: Array.isArray(item.tags) ? item.tags : [],
          };
        });
      } catch (e) {
        console.error('Failed to parse articles from localStorage:', e);
        return [...INITIAL_ARTICLES];
      }
    }

    return INITIAL_ARTICLES.map((item) => {
      const itemAuthor = item.author.trim().toLowerCase();
      const detectedOwn = itemAuthor === activeName || itemAuthor === defaultName;
      return {
        ...item,
        isOwn: detectedOwn,
        isVerifiedAuthor: detectedOwn
          ? currentUser.value.isVerified
          : itemAuthor.startsWith('dr') || itemAuthor.startsWith('prof'),
        author: detectedOwn ? currentUser.value.name : item.author,
      };
    });
  };

  const articles = ref<Article[]>(loadArticles());

  const updateProfile = (updated: Partial<UserProfile>) => {
    const oldName = currentUser.value.name.trim().toLowerCase();
    currentUser.value = { ...currentUser.value, ...updated };
    const newName = currentUser.value.name.trim();

    localStorage.setItem(PROFILE_KEY, JSON.stringify(currentUser.value));

    if (newName) {
      articles.value.forEach((article) => {
        if (
          article.isOwn ||
          article.author.trim().toLowerCase() === oldName
        ) {
          article.isOwn = true;
          article.author = newName;
          article.isVerifiedAuthor = currentUser.value.isVerified;
        }
        article.comments.forEach((comment) => {
          if (
            comment.isOwn ||
            comment.author.trim().toLowerCase() === oldName
          ) {
            comment.isOwn = true;
            comment.author = newName;
          }
        });
      });
    }
    notify('Zaktualizowano profil badacza');
  };

  // --- Filter, Search & Sort States ---
  const searchQuery = ref<string>('');
  const selectedField = ref<ScienceField | 'ALL'>('ALL');
  const selectedTag = ref<string | null>(null);
  const selectedAuthor = ref<string | null>(null);
  const onlyMine = ref<boolean>(false);
  const sortBy = ref<SortOption>('newest');

  // Modals state
  const activeArticle = ref<Article | null>(null);
  const citingArticle = ref<Article | null>(null);

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

      const matchesSelectedAuthor =
        !selectedAuthor.value ||
        article.author.trim().toLowerCase() === selectedAuthor.value.trim().toLowerCase();

      const matchesMine =
        !onlyMine.value ||
        Boolean(article.isOwn) ||
        article.author.trim().toLowerCase() === currentUser.value.name.trim().toLowerCase();

      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        Boolean(article.personalNote && article.personalNote.toLowerCase().includes(query)) ||
        article.tags.some((t) => t.toLowerCase().includes(query));

      return (
        matchesField &&
        matchesTag &&
        matchesSelectedAuthor &&
        matchesMine &&
        matchesSearch
      );
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

  // Scientometric profile indicators for current user
  const researcherMetrics = computed(() => {
    const ownList = articles.value.filter(
      (a) =>
        a.isOwn ||
        a.author.trim().toLowerCase() === currentUser.value.name.trim().toLowerCase()
    );
    return computeScientometrics(ownList);
  });

  // Summary card data when filtering by any specific author
  const selectedAuthorSummary = computed(() => {
    if (!selectedAuthor.value) return null;
    const target = selectedAuthor.value.trim().toLowerCase();
    const authorArticles = articles.value.filter(
      (a) => a.author.trim().toLowerCase() === target
    );
    if (authorArticles.length === 0) return null;

    const metrics = computeScientometrics(authorArticles);
    const isVerified = authorArticles.some((a) => Boolean(a.isVerifiedAuthor));
    const fields = Array.from(new Set(authorArticles.map((a) => a.field)));

    return {
      name: authorArticles[0].author,
      isVerified,
      fields,
      ...metrics,
    };
  });

  const topLikedArticles = computed<Article[]>(() => {
    return [...articles.value].sort((a, b) => b.likes - a.likes).slice(0, 3);
  });

  const savedArticles = computed<Article[]>(() => {
    return [...articles.value]
      .filter((article) => article.isSaved)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

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

  const fieldStats = computed(() => {
    const total = articles.value.length || 1;
    return SCIENCE_FIELDS.map((field) => {
      const count = articles.value.filter((a) => a.field === field).length;
      const percentage = Math.round((count / total) * 100);
      return { field, count, percentage };
    }).sort((a, b) => b.count - a.count);
  });

  // --- Actions ---
  const addArticle = (payload: ArticlePayload): void => {
    const cleanAuthor = payload.author.trim() || currentUser.value.name;
    const isCurrentUser =
      cleanAuthor.toLowerCase() === currentUser.value.name.trim().toLowerCase();

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title: payload.title.trim(),
      author: cleanAuthor,
      isOwn: isCurrentUser,
      isVerifiedAuthor: isCurrentUser ? currentUser.value.isVerified : false,
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
    notify('Opublikowano nowy artykuł naukowy');
  };

  const updateArticle = (id: string, payload: ArticlePayload): void => {
    const target = articles.value.find((a) => a.id === id);
    if (!target) return;

    const cleanAuthor = payload.author.trim() || target.author;
    const isCurrentUser =
      cleanAuthor.toLowerCase() === currentUser.value.name.trim().toLowerCase();

    target.title = payload.title.trim();
    target.author = cleanAuthor;
    target.isOwn = isCurrentUser;
    if (isCurrentUser) {
      target.isVerifiedAuthor = currentUser.value.isVerified;
    }
    target.field = payload.field;
    target.publicationType = payload.publicationType;
    target.tags = payload.tags;
    target.content = payload.content.trim();
    target.imageUrl = payload.imageUrl?.trim() || undefined;
    notify('Zapisano zmiany w publikacji');
  };

  const deleteArticle = (id: string): void => {
    const index = articles.value.findIndex((a) => a.id === id);
    if (index === -1) return;

    const removedCopy: Article = JSON.parse(JSON.stringify(articles.value[index]));
    articles.value.splice(index, 1);

    if (activeArticle.value?.id === id) {
      activeArticle.value = null;
    }

    notify('Usunięto publikację', {
      actionLabel: 'Cofnij',
      duration: 5000,
      onAction: () => {
        articles.value.splice(Math.min(index, articles.value.length), 0, removedCopy);
        notify('Przywrócono publikację', { duration: 2200 });
      },
    });
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
    notify(
      target.isSaved ? 'Zapisano w czytelni' : 'Usunięto z czytelni',
      { duration: 2200 }
    );
  };

  const updatePersonalNote = (articleId: string, note: string): void => {
    const target = articles.value.find((a) => a.id === articleId);
    if (!target) return;

    const trimmed = note.trim();
    target.personalNote = trimmed || undefined;
    if (trimmed && !target.isSaved) {
      target.isSaved = true;
    }
    notify(trimmed ? 'Zapisano notatkę badawczą' : 'Usunięto notatkę', {
      duration: 2200,
    });
  };

  const addComment = (articleId: string, text: string, author?: string): void => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const target = articles.value.find((a) => a.id === articleId);
    if (!target) return;

    const cleanAuthor = author?.trim() || currentUser.value.name;
    target.comments.push({
      id: `com-${Date.now()}`,
      author: cleanAuthor,
      isOwn: cleanAuthor.toLowerCase() === currentUser.value.name.trim().toLowerCase(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    });
    notify('Dodano komentarz', { duration: 2200 });
  };

  const updateComment = (articleId: string, commentId: string, newText: string): void => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const target = articles.value.find((a) => a.id === articleId);
    const comment = target?.comments.find((c) => c.id === commentId);
    if (!comment) return;

    comment.text = trimmed;
    notify('Zaktualizowano komentarz', { duration: 2200 });
  };

  const deleteComment = (articleId: string, commentId: string): void => {
    const target = articles.value.find((a) => a.id === articleId);
    if (!target) return;

    target.comments = target.comments.filter((c) => c.id !== commentId);
    notify('Usunięto komentarz', { duration: 2200 });
  };

  const selectTag = (tag: string | null): void => {
    selectedTag.value = selectedTag.value === tag ? null : tag;
  };

  const selectAuthor = (authorName: string | null): void => {
    if (!authorName) {
      selectedAuthor.value = null;
      return;
    }
    selectedAuthor.value =
      selectedAuthor.value?.toLowerCase() === authorName.trim().toLowerCase()
        ? null
        : authorName.trim();
    onlyMine.value = false;
  };

  const resetFilters = (): void => {
    searchQuery.value = '';
    selectedField.value = 'ALL';
    selectedTag.value = null;
    selectedAuthor.value = null;
    onlyMine.value = false;
    sortBy.value = 'newest';
  };

  const resetDemoData = (): void => {
    const activeName = currentUser.value.name;
    const defaultName = DEFAULT_PROFILE.name.trim().toLowerCase();

    articles.value = INITIAL_ARTICLES.map((item) => {
      const itemAuthor = item.author.trim().toLowerCase();
      const detectedOwn =
        itemAuthor === activeName.trim().toLowerCase() || itemAuthor === defaultName;
      return {
        ...item,
        isOwn: detectedOwn,
        isVerifiedAuthor: detectedOwn
          ? currentUser.value.isVerified
          : itemAuthor.startsWith('dr') || itemAuthor.startsWith('prof'),
        author: detectedOwn ? activeName : item.author,
      };
    });
    resetFilters();
    notify('Przywrócono domyślny zbiór publikacji');
  };

  // --- Live Academic Network Simulator ---
  const simulateNetworkActivity = (): void => {
    if (articles.value.length === 0) return;

    const peers = [
      'dr hab. Anna Kowalska',
      'prof. dr hab. Janusz Wiśniewski',
      'dr inż. Tomasz Kaczmarek',
      'dr Piotr Zieliński',
      'dr hab. n. med. Magdalena Lewandowska',
    ];

    const peerComments = [
      'Bardzo przejrzysta metodologia! Czy planujecie udostępnić zbiór danych testowych?',
      'Interesująca zbieżność wyników z naszymi ostatnimi pomiarami laboratoryjnymi.',
      'Warto byłoby zestawić ten model z podejściem probabilistycznym przy większej próbie.',
      'Świetnie sformułowane wnioski — dodaję tę publikację do swojej bibliografii.',
    ];

    const samplePreprints: Omit<Article, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'isSaved' | 'comments'>[] = [
      {
        title: 'Szybka estymacja zbieżności stochastycznej w układach wieloagentowych',
        author: 'dr Piotr Zieliński',
        isOwn: false,
        isVerifiedAuthor: true,
        field: 'Informatyka',
        publicationType: 'Notatka badawcza',
        tags: ['stochastyka', 'zbieznosc', 'symulacje'],
        content:
          'Wstępne pomiary pokazują, że błąd średniokwadratowy maleje zgodnie z zależnością:\n\n$$\n\\epsilon_n \\approx \\frac{\\sigma}{\\sqrt{n}} + O(n^{-1})\n$$\n\n> Zastosowanie adaptacyjnego kroku skraca czas stabilizacji układu o 28%.',
      },
      {
        title: 'Optymalizacja drzew decyzyjnych w czasie rzeczywistym dla systemów wbudowanych',
        author: 'dr inż. Tomasz Kaczmarek',
        isOwn: false,
        isVerifiedAuthor: true,
        field: 'Informatyka',
        publicationType: 'Preprint',
        tags: ['algorytmy', 'optymalizacja', 'embedded'],
        content:
          'Zredukowaliśmy zużycie pamięci podręcznej poprzez kwantyzację progów podziału do 8-bitowych liczb stałoprzecinkowych.\n\n```python\ndef quantize_threshold(val: float, scale: float) -> int:\n    return max(-128, min(127, round(val / scale)))\n```\n\nOpóźnienie inferencji spadło z $4.2\\text{ ms}$ do $1.1\\text{ ms}$.',
      },
      {
        title: 'Spektroskopia ramanowska cienkich warstw tlenku grafenu po wygrzewaniu laserowym',
        author: 'prof. dr hab. Janusz Wiśniewski',
        isOwn: false,
        isVerifiedAuthor: true,
        field: 'Fizyka',
        publicationType: 'Notatka badawcza',
        tags: ['grafen', 'spektroskopia', 'materialy'],
        content:
          'Stosunek intensywności pasm $I_D / I_G$ uległ obniżeniu z $1.18$ do $0.42$ po impulsowej obróbce w atmosferze argonu.\n\n> Potwierdza to częściową odbudowę sieci $sp^2$ bez degradacji podłoża kwarcowego.',
      },
    ];

    const randomPeer = peers[Math.floor(Math.random() * peers.length)];
    const roll = Math.random();

    if (roll < 0.45) {
      // Peer leaves a scientific comment
      const target = articles.value[Math.floor(Math.random() * articles.value.length)];
      const commentText = peerComments[Math.floor(Math.random() * peerComments.length)];
      target.comments.push({
        id: `com-sim-${Date.now()}`,
        author: randomPeer,
        isOwn: false,
        text: commentText,
        createdAt: new Date().toISOString(),
      });
      notify(`${randomPeer} skomentował(a): „${target.title.slice(0, 32)}...”`, {
        duration: 4200,
      });
    } else if (roll < 0.75) {
      // Peer endorses a publication
      const target = articles.value[Math.floor(Math.random() * articles.value.length)];
      target.likes += 1;
      notify(`${randomPeer} polecił(a) pracę „${target.title.slice(0, 32)}...”`, {
        duration: 3600,
      });
    } else {
      // Peer publishes a fresh preprint / research note
      const template = samplePreprints[Math.floor(Math.random() * samplePreprints.length)];
      const newPeerPost: Article = {
        ...template,
        id: `art-sim-${Date.now()}`,
        createdAt: new Date().toISOString(),
        likes: Math.floor(Math.random() * 5) + 1,
        isLiked: false,
        isSaved: false,
        comments: [],
      };
      articles.value.unshift(newPeerPost);
      notify(`Nowa publikacja: ${newPeerPost.author} (${newPeerPost.field})`, {
        duration: 4200,
      });
    }
  };

  // --- JSON & BibTeX Export / Import ---
  const exportArticlesJson = (): void => {
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: 'ScienceNet',
      articles: articles.value,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sciencenet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Wyeksportowano archiwum publikacji (.json)');
  };

  const exportSavedBibtex = (): void => {
    const list = savedArticles.value;
    if (list.length === 0) {
      notify('Czytelnia jest pusta — brak pozycji do eksportu');
      return;
    }

    const entries = list.map((art) => {
      const year = new Date(art.createdAt).getFullYear();
      const lastName = (art.author.trim().split(/\s+/).pop() || 'author')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const key = `${lastName || 'ref'}${year}_${art.id.slice(-3)}`;
      const entryType =
        art.publicationType === 'Preprint' || art.publicationType === 'Notatka badawcza'
          ? 'misc'
          : 'article';

      return [
        `@${entryType}{${key},`,
        `  author = {${art.author}},`,
        `  title = {{${art.title}}},`,
        `  journal = {ScienceNet (${art.field})},`,
        `  year = {${year}},`,
        `  note = {${art.publicationType}}`,
        `}`,
      ].join('\n');
    });

    const blob = new Blob([entries.join('\n\n') + '\n'], {
      type: 'application/x-bibtex;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sciencenet-czytelnia-${new Date().toISOString().slice(0, 10)}.bib`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`Wyeksportowano ${list.length} pozycji do pliku .bib`);
  };

  const importArticlesJson = (rawJson: string): boolean => {
    try {
      const parsed = JSON.parse(rawJson);
      const list = Array.isArray(parsed) ? parsed : parsed?.articles;
      if (!Array.isArray(list)) {
        notify('Nieprawidłowy format pliku JSON');
        return false;
      }

      const sanitized: Article[] = list
        .filter((item) => item && typeof item.title === 'string' && typeof item.content === 'string')
        .map((item, idx) => ({
          id: item.id || `art-imp-${Date.now()}-${idx}`,
          title: item.title,
          author: item.author || 'Autor zaimportowany',
          isOwn: Boolean(item.isOwn),
          isVerifiedAuthor: Boolean(item.isVerifiedAuthor),
          field: SCIENCE_FIELDS.includes(item.field) ? item.field : 'Informatyka',
          publicationType: item.publicationType || 'Artykuł badawczy',
          tags: Array.isArray(item.tags) ? item.tags : [],
          content: item.content,
          imageUrl: item.imageUrl || undefined,
          createdAt: item.createdAt || new Date().toISOString(),
          likes: typeof item.likes === 'number' ? item.likes : 0,
          isLiked: Boolean(item.isLiked),
          isSaved: Boolean(item.isSaved),
          personalNote: typeof item.personalNote === 'string' ? item.personalNote : undefined,
          comments: Array.isArray(item.comments) ? item.comments : [],
        }));

      articles.value = sanitized;
      resetFilters();
      notify(`Zaimportowano ${sanitized.length} publikacji z archiwum`);
      return true;
    } catch {
      notify('Błąd podczas odczytu pliku JSON');
      return false;
    }
  };

  return {
    toasts,
    notify,
    dismissToast,
    theme,
    toggleTheme,
    currentUser,
    updateProfile,
    articles,
    searchQuery,
    selectedField,
    selectedTag,
    selectedAuthor,
    onlyMine,
    sortBy,
    activeArticle,
    citingArticle,
    filteredArticles,
    researcherMetrics,
    selectedAuthorSummary,
    topLikedArticles,
    savedArticles,
    popularTags,
    fieldStats,
    addArticle,
    updateArticle,
    deleteArticle,
    toggleLike,
    toggleSave,
    updatePersonalNote,
    addComment,
    updateComment,
    deleteComment,
    selectTag,
    selectAuthor,
    resetFilters,
    resetDemoData,
    simulateNetworkActivity,
    exportArticlesJson,
    exportSavedBibtex,
    importArticlesJson,
  };
});