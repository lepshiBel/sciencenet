<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '../stores/useArticleStore';
import type { Article, ArticlePayload, ScienceField } from '../types/article';
import ArticleCard from '../components/ArticleCard.vue';
import ArticleForm from '../components/ArticleForm.vue';
import AppIcon from '../components/AppIcon.vue';

type SavedCollection = 'all' | 'notes' | 'own';

const store = useArticleStore();
const router = useRouter();

const editingArticle = ref<Article | null>(null);
const activeCollection = ref<SavedCollection>('all');
const selectedField = ref<ScienceField | 'ALL'>('ALL');

const notedCount = computed(
  () => store.savedArticles.filter((a) => Boolean(a.personalNote?.trim())).length
);

const ownSavedCount = computed(
  () =>
    store.savedArticles.filter(
      (a) =>
        Boolean(a.isOwn) ||
        a.author.trim().toLowerCase() === store.currentUser.name.trim().toLowerCase()
    ).length
);

// Unique fields present in the user's saved list
const availableFields = computed<ScienceField[]>(() => {
  const set = new Set<ScienceField>();
  for (const art of store.savedArticles) {
    set.add(art.field);
  }
  return Array.from(set);
});

const displayedArticles = computed<Article[]>(() => {
  return store.savedArticles.filter((art) => {
    if (activeCollection.value === 'notes' && !art.personalNote?.trim()) {
      return false;
    }
    if (
      activeCollection.value === 'own' &&
      !art.isOwn &&
      art.author.trim().toLowerCase() !== store.currentUser.name.trim().toLowerCase()
    ) {
      return false;
    }
    if (selectedField.value !== 'ALL' && art.field !== selectedField.value) {
      return false;
    }
    return true;
  });
});

const resetCollectionFilters = () => {
  activeCollection.value = 'all';
  selectedField.value = 'ALL';
};

const startEditing = (article: Article) => {
  editingArticle.value = article;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleEditSubmit = (payload: ArticlePayload) => {
  if (!editingArticle.value) return;
  store.updateArticle(editingArticle.value.id, payload);
  editingArticle.value = null;
};

const handleSelectTag = (tag: string) => {
  store.selectTag(tag);
  router.push('/');
};

const handleSelectAuthor = (authorName: string) => {
  store.selectAuthor(authorName);
  router.push('/');
};
</script>

<template>
  <section class="saved-view">
    <div class="card saved-header">
      <div class="header-top-row">
        <div class="header-left">
          <RouterLink to="/" class="back-pill">
            <span>←</span>
            <span>Tablica</span>
          </RouterLink>
          <div>
            <h1>Czytelnia badacza</h1>
            <p>Zapisane publikacje oraz Twoje prywatne notatki do późniejszej analizy.</p>
          </div>
        </div>

        <div class="header-right">
          <button
            v-if="store.savedArticles.length > 0"
            type="button"
            class="bib-export-btn"
            title="Pobierz wszystkie zapisane pozycje w formacie BibTeX"
            @click="store.exportSavedBibtex()"
          >
            <AppIcon name="quote" :size="14" />
            <span>Eksportuj .bib</span>
          </button>

          <span class="saved-badge">
            {{ store.savedArticles.length }} zapisanych
          </span>
        </div>
      </div>

      <!-- Smart Collections & Discipline Filter Bar -->
      <div v-if="store.savedArticles.length > 0" class="collections-bar">
        <div class="collection-tabs">
          <button
            type="button"
            class="col-tab"
            :class="{ active: activeCollection === 'all' }"
            @click="activeCollection = 'all'"
          >
            <span>Wszystkie</span>
            <span class="col-count">{{ store.savedArticles.length }}</span>
          </button>

          <button
            type="button"
            class="col-tab"
            :class="{ active: activeCollection === 'notes' }"
            @click="activeCollection = 'notes'"
          >
            <span>Z notatkami</span>
            <span class="col-count">{{ notedCount }}</span>
          </button>

          <button
            type="button"
            class="col-tab"
            :class="{ active: activeCollection === 'own' }"
            @click="activeCollection = 'own'"
          >
            <span>Moje publikacje</span>
            <span class="col-count">{{ ownSavedCount }}</span>
          </button>
        </div>

        <select
          v-if="availableFields.length > 1"
          v-model="selectedField"
          class="field-mini-select"
          aria-label="Filtruj czytelnię po dziedzinie"
        >
          <option value="ALL">Wszystkie dziedziny</option>
          <option v-for="f in availableFields" :key="f" :value="f">
            {{ f }}
          </option>
        </select>
      </div>
    </div>

    <!-- Inline Edit Form when editing a saved article -->
    <ArticleForm
      v-if="editingArticle"
      :editing-article="editingArticle"
      :default-author="store.currentUser.name"
      :avatar-url="store.currentUser.avatarUrl"
      @submit="handleEditSubmit"
      @cancel="editingArticle = null"
    />

    <div v-if="store.savedArticles.length === 0" class="card empty-saved">
      <div class="empty-icon">
        <AppIcon name="bookmark" :size="26" />
      </div>
      <h2>Twoja czytelnia jest pusta</h2>
      <p>
        Kliknij przycisk <strong>„Zapisz”</strong> przy dowolnym artykule na tablicy głównej
        lub dodaj własną notatkę w trybie czytania.
      </p>
      <RouterLink to="/" class="back-btn">
        <span>←</span>
        <span>Wróć do tablicy głównej</span>
      </RouterLink>
    </div>

    <div v-else-if="displayedArticles.length === 0" class="card empty-saved">
      <h2>Brak pozycji w wybranej kolekcji</h2>
      <p>Nie znaleziono zapisanych publikacji spełniających aktywny filtr czytelni.</p>
      <button type="button" class="back-btn" @click="resetCollectionFilters">
        Pokaż wszystkie zapisane
      </button>
    </div>

    <div v-else class="saved-grid">
      <ArticleCard
        v-for="article in displayedArticles"
        :key="article.id"
        :article="article"
        @toggle-like="store.toggleLike"
        @toggle-save="store.toggleSave"
        @edit="startEditing"
        @delete="store.deleteArticle"
        @read="store.activeArticle = $event"
        @cite="store.citingArticle = $event"
        @select-tag="handleSelectTag"
        @select-author="handleSelectAuthor"
      />
    </div>
  </section>
</template>

<style scoped>
.saved-view {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-header {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
}

.back-pill:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.saved-header h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
}

.saved-header p {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bib-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.15s, color 0.15s;
}

.bib-export-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  border-color: var(--border-strong);
}

.saved-badge {
  font-family: var(--font-mono);
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid var(--primary-border);
  font-weight: 600;
  font-size: 0.78rem;
  padding: 5px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Collections Bar */
.collections-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.collection-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.col-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.col-tab:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.col-tab.active {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.col-count {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.field-mini-select {
  padding: 5px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
}

.field-mini-select:focus {
  outline: none;
  border-color: var(--primary);
}

.empty-saved {
  padding: 46px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-saved h2 {
  font-size: 1.08rem;
  color: var(--text-main);
}

.empty-saved p {
  font-size: 0.88rem;
  color: var(--text-muted);
  max-width: 440px;
}

.back-btn {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: var(--radius-md);
  border: none;
}

[data-theme='dark'] .back-btn {
  color: #0f1117;
}

.saved-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>