<script setup lang="ts">
import { ref } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import type { Article, ArticlePayload } from '../types/article';
import ArticleForm from '../components/ArticleForm.vue';
import FieldFilterBar from '../components/FieldFilterBar.vue';
import ArticleCard from '../components/ArticleCard.vue';
import AppIcon from '../components/AppIcon.vue';

const store = useArticleStore();
const editingArticle = ref<Article | null>(null);

const handleFormSubmit = (payload: ArticlePayload) => {
  if (editingArticle.value) {
    store.updateArticle(editingArticle.value.id, payload);
    editingArticle.value = null;
  } else {
    store.addArticle(payload);
  }
};

const startEditing = (article: Article) => {
  editingArticle.value = article;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEditing = () => {
  editingArticle.value = null;
};

const handleDelete = (id: string) => {
  if (editingArticle.value?.id === id) {
    editingArticle.value = null;
  }
  store.deleteArticle(id);
};
</script>

<template>
  <section class="feed-section">
    <!-- Collapsible Publication / Edit Form -->
    <ArticleForm
      :editing-article="editingArticle"
      :default-author="store.currentUser.name"
      :avatar-url="store.currentUser.avatarUrl"
      @submit="handleFormSubmit"
      @cancel="cancelEditing"
    />

    <!-- Filter, Tag, Author & Sort Controls -->
    <FieldFilterBar
      :selected="store.selectedField"
      :selected-tag="store.selectedTag"
      :selected-author="store.selectedAuthor"
      :only-mine="store.onlyMine"
      :sort-by="store.sortBy"
      @select="store.selectedField = $event"
      @clear-tag="store.selectedTag = null"
      @clear-author="store.selectedAuthor = null"
      @toggle-mine="store.onlyMine = !store.onlyMine"
      @update:sort-by="store.sortBy = $event"
    />

    <!-- Researcher Summary Card when filtering by a specific author -->
    <div v-if="store.selectedAuthorSummary" class="card author-summary-card">
      <div class="author-summary-main">
        <div class="author-title-row">
          <h2>{{ store.selectedAuthorSummary.name }}</h2>
          <span
            v-if="store.selectedAuthorSummary.isVerified"
            class="verified-pill"
            title="Zweryfikowany badacz"
          >
            <AppIcon name="check" :size="11" />
            <span>Zweryfikowany autor</span>
          </span>
        </div>
        <p class="author-fields-list">
          Obszar badań: {{ store.selectedAuthorSummary.fields.join(', ') }}
        </p>
      </div>

      <div class="author-summary-right">
        <div class="author-kpis">
          <div class="kpi-chip">
            <strong>{{ store.selectedAuthorSummary.publications }}</strong>
            <span>Publikacje</span>
          </div>
          <div class="kpi-chip">
            <strong>{{ store.selectedAuthorSummary.citations }}</strong>
            <span>Cytowania</span>
          </div>
          <div class="kpi-chip">
            <strong>{{ store.selectedAuthorSummary.hIndex }}</strong>
            <span>h-index</span>
          </div>
        </div>

        <button
          type="button"
          class="clear-author-btn"
          @click="store.selectAuthor(null)"
        >
          <AppIcon name="close" :size="13" />
          <span>Pokaż wszystkich</span>
        </button>
      </div>
    </div>

    <!-- Articles Feed -->
    <div v-if="store.filteredArticles.length > 0" class="articles-list">
      <ArticleCard
        v-for="article in store.filteredArticles"
        :key="article.id"
        :article="article"
        :active-author="store.selectedAuthor"
        @toggle-like="store.toggleLike"
        @toggle-save="store.toggleSave"
        @edit="startEditing"
        @delete="handleDelete"
        @read="store.activeArticle = $event"
        @cite="store.citingArticle = $event"
        @select-tag="store.selectTag"
        @select-author="store.selectAuthor"
      />
    </div>

    <!-- Empty Filter Result -->
    <div v-else class="card empty-state">
      <div class="empty-icon">
        <AppIcon name="search" :size="24" />
      </div>
      <h3>Brak publikacji spełniających kryteria</h3>
      <p>
        Nie znaleziono artykułów pasujących do wpisanej frazy, dziedziny lub wybranego filtra.
      </p>
      <div class="empty-actions">
        <button
          type="button"
          class="btn-reset"
          @click="store.resetFilters()"
        >
          Wyczyść filtry
        </button>
        <button
          v-if="store.articles.length === 0"
          type="button"
          class="btn-restore"
          @click="store.resetDemoData()"
        >
          Przywróć przykładowe artykuły
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feed-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.author-summary-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-color: var(--primary-border);
  background: var(--primary-soft);
}

.author-summary-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.author-title-row h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bg-card);
  border: 1px solid var(--primary-border);
  color: var(--primary);
}

.author-fields-list {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.author-summary-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.author-kpis {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kpi-chip {
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  text-align: center;
  min-width: 66px;
}

.kpi-chip strong {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  color: var(--text-main);
  line-height: 1.2;
}

.kpi-chip span {
  font-size: 0.66rem;
  color: var(--text-muted);
}

.clear-author-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
}

.clear-author-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empty-state {
  padding: 44px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-state h3 {
  font-size: 1.05rem;
  color: var(--text-main);
}

.empty-state p {
  font-size: 0.88rem;
  color: var(--text-muted);
  max-width: 420px;
}

.empty-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-reset,
.btn-restore {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-reset {
  background: var(--primary);
  color: #ffffff;
  border: none;
}

[data-theme='dark'] .btn-reset {
  color: #0f1117;
}

.btn-restore {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
</style>