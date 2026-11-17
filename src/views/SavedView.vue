<script setup lang="ts">
import { ref } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import type { Article, ArticlePayload } from '../types/article';
import ArticleCard from '../components/ArticleCard.vue';
import ArticleForm from '../components/ArticleForm.vue';

const store = useArticleStore();
const editingArticle = ref<Article | null>(null);

const handleUpdate = (payload: ArticlePayload) => {
  if (!editingArticle.value) return;
  store.updateArticle(editingArticle.value.id, payload);
  editingArticle.value = null;
};
</script>

<template>
  <div class="saved-view">
    <div class="card saved-header">
      <div>
        <h2>🔖 Zapisane artykuły</h2>
        <p class="subtitle">
          Twoja prywatna czytelnia publikacji naukowych ({{ store.savedArticles.length }})
        </p>
      </div>
      <RouterLink to="/" class="back-link">← Wróć na tablicę</RouterLink>
    </div>

    <ArticleForm
      v-if="editingArticle"
      :editing-article="editingArticle"
      @submit="handleUpdate"
      @cancel="editingArticle = null"
    />

    <div v-if="store.savedArticles.length > 0" class="articles-list">
      <ArticleCard
        v-for="article in store.savedArticles"
        :key="article.id"
        :article="article"
        @toggle-like="store.toggleLike"
        @toggle-save="store.toggleSave"
        @edit="(art) => (editingArticle = art)"
        @delete="store.deleteArticle"
        @add-comment="({ articleId, text }) => store.addComment(articleId, text)"
      />
    </div>

    <div v-else class="card empty-saved">
      <p class="empty-icon">📑</p>
      <h3>Nie masz jeszcze zapisanych artykułów</h3>
      <p>Kliknij przycisk „Zapisz” przy interesującej publikacji na głównej tablicy, aby wrócić do niej później.</p>
      <RouterLink to="/" class="browse-btn">Przeglądaj tablicę</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.saved-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-header {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.saved-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.subtitle {
  font-size: 0.86rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.back-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--primary);
}

.back-link:hover {
  text-decoration: underline;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-saved {
  padding: 40px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  font-size: 2rem;
}

.empty-saved h3 {
  font-size: 1.05rem;
  color: var(--text-main);
}

.empty-saved p {
  font-size: 0.9rem;
  color: var(--text-muted);
  max-width: 420px;
}

.browse-btn {
  margin-top: 8px;
  padding: 9px 18px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>