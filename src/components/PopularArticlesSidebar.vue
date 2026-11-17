<script setup lang="ts">
import { useArticleStore } from '../stores/useArticleStore';

const store = useArticleStore();

const handleReset = () => {
  if (confirm('Przywrócić domyślne artykuły demonstracyjne?')) {
    store.resetDemoData();
  }
};
</script>

<template>
  <aside class="sidebar-wrapper">
    <div class="card popular-card">
      <h3 class="sidebar-title">🔥 Najczęściej polubione</h3>

      <ul v-if="store.topLikedArticles.length > 0" class="popular-list">
        <li
          v-for="(article, index) in store.topLikedArticles"
          :key="article.id"
          class="popular-item"
        >
          <span class="rank">#{{ index + 1 }}</span>
          <div class="item-info">
            <p class="item-title">{{ article.title }}</p>
            <div class="item-meta">
              <span>{{ article.author }}</span>
              <span class="likes-pill">👍 {{ article.likes }}</span>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="empty-note">Brak artykułów do wyświetlenia.</p>
    </div>

    <div class="card info-card">
      <p class="info-text">
        Dane zapisywane są lokalnie w przeglądarce (<code>localStorage</code>).
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
  top: 76px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.popular-card,
.info-card {
  padding: 18px;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 14px;
}

.popular-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.popular-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.popular-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.rank {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.likes-pill {
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
}

.empty-note {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.info-text {
  font-size: 0.8rem;
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
  font-size: 0.82rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background: var(--border);
}
</style>