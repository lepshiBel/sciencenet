<script setup lang="ts">
import { ref } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import type { Article, ArticlePayload } from '../types/article';
import ArticleForm from '../components/ArticleForm.vue';
import FieldFilterBar from '../components/FieldFilterBar.vue';
import ArticleCard from '../components/ArticleCard.vue';

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

const clearFilters = () => {
  store.searchQuery = '';
  store.selectedField = 'ALL';
};
</script>

<template>
  <div class="home-feed">
    <ArticleForm
      :editing-article="editingArticle"
      :default-author="store.currentUser.name"
      @submit="handleFormSubmit"
      @cancel="cancelEditing"
    />

    <FieldFilterBar
      :selected="store.selectedField"
      @select="(field) => (store.selectedField = field)"
    />

    <div v-if="store.filteredArticles.length > 0" class="articles-list">
      <ArticleCard
        v-for="article in store.filteredArticles"
        :key="article.id"
        :article="article"
        @toggle-like="store.toggleLike"
        @toggle-save="store.toggleSave"
        @edit="startEditing"
        @delete="store.deleteArticle"
        @add-comment="({ articleId, text }) => store.addComment(articleId, text)"
      />
    </div>

    <div v-else class="card empty-state">
      <h3>Brak artykułów spełniających kryteria</h3>
      <p>Spróbuj zmienić frazę wyszukiwania lub wybrać inną dziedzinę nauki.</p>
      <button
        v-if="store.searchQuery || store.selectedField !== 'ALL'"
        type="button"
        class="reset-filters-btn"
        @click="clearFilters"
      >
        Wyczyść filtry
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  padding: 36px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-state h3 {
  font-size: 1.05rem;
  color: var(--text-main);
}

.empty-state p {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.reset-filters-btn {
  margin-top: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.88rem;
}
</style>