<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '../stores/useArticleStore';
import type { Article, ArticlePayload } from '../types/article';
import ArticleCard from '../components/ArticleCard.vue';
import ArticleForm from '../components/ArticleForm.vue';
import AppIcon from '../components/AppIcon.vue';

const store = useArticleStore();
const router = useRouter();

const editingArticle = ref<Article | null>(null);

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

    <div v-else class="saved-grid">
      <ArticleCard
        v-for="article in store.savedArticles"
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