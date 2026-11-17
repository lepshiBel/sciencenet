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

const handleUpdate = (payload: ArticlePayload) => {
  if (!editingArticle.value) return;
  store.updateArticle(editingArticle.value.id, payload);
  editingArticle.value = null;
};

const handleTagSelect = (tag: string) => {
  store.selectTag(tag);
  router.push('/');
};

const handleAuthorSelect = (author: string) => {
  store.selectAuthor(author);
  router.push('/');
};
</script>

<template>
  <div class="saved-view">
    <div class="card saved-header">
      <div class="header-info">
        <div class="title-row">
          <AppIcon name="bookmark-filled" :size="18" />
          <h2>Czytelnia — Zapisane publikacje</h2>
        </div>
        <p class="subtitle">
          Zarchiwizowane artykuły do późniejszej lektury ({{ store.savedArticles.length }})
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
        @open-reader="(art) => (store.activeArticle = art)"
        @cite="(art) => (store.citingArticle = art)"
        @select-tag="handleTagSelect"
        @select-author="handleAuthorSelect"
        @add-comment="({ articleId, text }) => store.addComment(articleId, text)"
      />
    </div>

    <div v-else class="card empty-saved">
      <div class="empty-icon">
        <AppIcon name="bookmark" :size="28" />
      </div>
      <h3>Brak zapisanych publikacji</h3>
      <p>
        Użyj przycisku „Zapisz” na dowolnej karcie artykułu, aby dodać go do swojej czytelni.
      </p>
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

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
}

.title-row h2 {
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--text-main);
}

.subtitle {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 3px;
}

.back-link {
  font-size: 0.86rem;
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
  color: var(--text-muted);
}

.empty-saved h3 {
  font-size: 1.05rem;
  color: var(--text-main);
}

.empty-saved p {
  font-size: 0.88rem;
  color: var(--text-muted);
  max-width: 420px;
}

.browse-btn {
  margin-top: 8px;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.88rem;
}

[data-theme='dark'] .browse-btn {
  color: #0f1117;
}
</style>