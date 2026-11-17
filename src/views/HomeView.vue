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
</script>

<template>
  <div class="home-feed">
    <ArticleForm
      :editing-article="editingArticle"
      :default-author="store.currentUser.name"
      :avatar-url="store.currentUser.avatarUrl"
      @submit="handleFormSubmit"
      @cancel="cancelEditing"
    />

    <FieldFilterBar
      :selected="store.selectedField"
      :selected-tag="store.selectedTag"
      :selected-author="store.selectedAuthor"
      :only-mine="store.onlyMine"
      :sort-by="store.sortBy"
      @select="(field) => (store.selectedField = field)"
      @clear-tag="store.selectedTag = null"
      @clear-author="store.selectedAuthor = null"
      @toggle-mine="store.onlyMine = !store.onlyMine"
      @update:sort-by="(val) => (store.sortBy = val)"
    />

    <div v-if="store.filteredArticles.length > 0" class="articles-list">
      <ArticleCard
        v-for="article in store.filteredArticles"
        :key="article.id"
        :article="article"
        :active-tag="store.selectedTag"
        :active-author="store.selectedAuthor"
        @toggle-like="store.toggleLike"
        @toggle-save="store.toggleSave"
        @edit="startEditing"
        @delete="store.deleteArticle"
        @open-reader="(art) => (store.activeArticle = art)"
        @cite="(art) => (store.citingArticle = art)"
        @select-tag="store.selectTag"
        @select-author="store.selectAuthor"
        @add-comment="({ articleId, text }) => store.addComment(articleId, text)"
      />
    </div>

    <div v-else class="card empty-state">
      <h3>Brak publikacji spełniających kryteria</h3>
      <p>Zmień frazę wyszukiwania, autora, wybrany tag lub dziedzinę nauki.</p>
      <button
        type="button"
        class="reset-filters-btn"
        @click="store.resetFilters"
      >
        Wyczyść wszystkie filtry
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
  font-size: 0.88rem;
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
  font-size: 0.86rem;
}

[data-theme='dark'] .reset-filters-btn {
  color: #0f1117;
}
</style>