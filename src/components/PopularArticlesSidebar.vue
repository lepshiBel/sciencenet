<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useArticleStore } from '../stores/useArticleStore';
import { FIELD_STYLES } from '../data/mockArticles';
import type { ScienceField } from '../types/article';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();
const router = useRouter();
const route = useRoute();
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleTagClick = (tagName: string) => {
  store.selectTag(tagName);
  if (route.path !== '/') {
    router.push('/');
  }
};

const handleFieldClick = (field: ScienceField) => {
  store.selectedField = store.selectedField === field ? 'ALL' : field;
  if (route.path !== '/') {
    router.push('/');
  }
};

const triggerImport = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      store.importArticlesJson(reader.result);
    }
    input.value = '';
  };
  reader.readAsText(file);
};
</script>

<template>
  <aside class="sidebar-wrapper">
    <!-- Top Liked Publications -->
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

    <!-- Discipline Distribution Analytics -->
    <div class="card sidebar-card">
      <h3 class="sidebar-title">
        <AppIcon name="chart" :size="15" />
        <span>Rozkład dziedzin</span>
      </h3>

      <ul class="analytics-list">
        <li
          v-for="stat in store.fieldStats"
          :key="stat.field"
          class="analytics-item"
          :class="{ active: store.selectedField === stat.field }"
          @click="handleFieldClick(stat.field)"
        >
          <div class="analytics-header">
            <span class="analytics-name">{{ stat.field }}</span>
            <span class="analytics-nums">
              {{ stat.count }} ({{ stat.percentage }}%)
            </span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{
                width: `${stat.percentage}%`,
                backgroundColor: FIELD_STYLES[stat.field].text,
              }"
            ></div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Keywords Cloud -->
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

    <!-- Data Archive & Backup -->
    <div class="card sidebar-card">
      <h3 class="sidebar-title">
        <AppIcon name="feed" :size="15" />
        <span>Archiwum danych</span>
      </h3>
      <p class="info-text">
        Kopia zapasowa repozytorium (<code>localStorage</code>) w formacie JSON.
      </p>

      <div class="archive-actions">
        <button
          type="button"
          class="archive-btn"
          @click="store.exportArticlesJson"
        >
          <AppIcon name="download" :size="14" />
          <span>Eksportuj</span>
        </button>

        <button
          type="button"
          class="archive-btn"
          @click="triggerImport"
        >
          <AppIcon name="upload" :size="14" />
          <span>Importuj</span>
        </button>

        <input
          ref="fileInputRef"
          type="file"
          accept=".json,application/json"
          class="hidden-file-input"
          @change="handleFileChange"
        />
      </div>

      <button type="button" class="reset-btn" @click="store.resetDemoData">
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
  padding: 16px 18px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12px;
}

.popular-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.popular-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 11px;
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
  font-size: 0.76rem;
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
  font-size: 0.92rem;
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
  margin-top: 4px;
  font-size: 0.75rem;
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

/* Field Analytics */
.analytics-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.analytics-item {
  cursor: pointer;
  padding: 4px 6px;
  margin: 0 -6px;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s;
}

.analytics-item:hover,
.analytics-item.active {
  background: var(--bg-subtle);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.analytics-name {
  font-weight: 600;
  color: var(--text-secondary);
}

.analytics-item.active .analytics-name {
  color: var(--primary);
  font-weight: 700;
}

.analytics-nums {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.progress-track {
  width: 100%;
  height: 5px;
  border-radius: 999px;
  background: var(--bg-subtle);
  overflow: hidden;
  border: 1px solid var(--border);
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* Tags Cloud */
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
  font-size: 0.75rem;
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

/* Archive & Backup */
.info-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.archive-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.archive-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-md);
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 0.79rem;
  font-weight: 600;
  transition: filter 0.15s;
}

.archive-btn:hover {
  filter: brightness(0.95);
}

.hidden-file-input {
  display: none;
}

.reset-btn {
  width: 100%;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.79rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}
</style>