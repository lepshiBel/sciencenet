<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();
const router = useRouter();
const route = useRoute();

const handleTagClick = (tagName: string) => {
  store.selectTag(tagName);
  if (route.path !== '/') {
    router.push('/');
  }
};

const handleReset = () => {
  if (confirm('Przywrócić domyślne artykuły demonstracyjne?')) {
    store.resetDemoData();
  }
};
</script>

<template>
  <aside class="sidebar-wrapper">
    <div class="card sidebar-card">
      <h3 class="sidebar-title">
        <AppIcon name="trending" :size="16" />
        <span>Najczęściej polubione</span>
      </h3>

      <ul v-if="store.topLikedArticles.length > 0" class="popular-list">
        <li
          v-for="(article, index) in store.topLikedArticles"
          :key="article.id"
          class="popular-item"
          @click="store.activeArticle = article"
        >
          <span class="rank">0{{ index + 1 }}</span>
          <div class="item-info">
            <p class="item-title">{{ article.title }}</p>
            <div class="item-meta">
              <span class="item-author">{{ article.author }}</span>
              <span class="likes-pill">
                <AppIcon name="thumbs-up" :size="12" />
                {{ article.likes }}
              </span>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="empty-note">Brak publikacji do wyświetlenia.</p>
    </div>

    <div v-if="store.popularTags.length > 0" class="card sidebar-card">
      <h3 class="sidebar-title">
        <AppIcon name="tag" :size="15" />
        <span>Popularne słowa kluczowe</span>
      </h3>

      <div class="tags-cloud">
        <button
          v-for="tag in store.popularTags"
          :key="tag.name"
          type="button"
          class="cloud-tag"
          :class="{ active: store.selectedTag === tag.name }"
          @click="handleTagClick(tag.name)"
        >
          #{{ tag.name }}
          <span class="tag-count">{{ tag.count }}</span>
        </button>
      </div>
    </div>

    <div class="card sidebar-card">
      <p class="info-text">
        Dane przechowywane są lokalnie w pamięci przeglądarki (<code>localStorage</code>).
      </p>
      <button type="button" class="reset-btn" @click="handleReset">
        Przywróć dane startowe
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-wrapper {
  position: sticky;
  top: 74px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  padding: 18px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 14px;
}

.popular-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popular-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.popular-item:hover .item-title {
  color: var(--primary);
}

.popular-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.rank {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-family: var(--font-serif);
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
  font-size: 0.76rem;
  color: var(--text-muted);
}

.item-author {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.likes-pill {
  font-family: var(--font-mono);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cloud-tag {
  font-family: var(--font-mono);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.76rem;
  transition: all 0.15s;
}

.cloud-tag:hover {
  border-color: var(--primary-border);
  color: var(--primary);
}

.cloud-tag.active {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
  font-weight: 600;
}

.tag-count {
  opacity: 0.7;
  font-size: 0.7rem;
}

.empty-note {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.info-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.reset-btn {
  width: 100%;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>