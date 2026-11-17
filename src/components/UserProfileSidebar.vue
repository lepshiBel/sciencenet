<script setup lang="ts">
import { computed } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';

const store = useArticleStore();

const totalLikes = computed(() =>
  store.articles.reduce((sum, article) => sum + article.likes, 0)
);
</script>

<template>
  <aside class="card profile-card">
    <div class="cover-banner"></div>

    <div class="profile-body">
      <img
        :src="store.currentUser.avatarUrl"
        :alt="store.currentUser.name"
        class="avatar"
      />

      <h2 class="user-name">{{ store.currentUser.name }}</h2>
      <p class="user-title">{{ store.currentUser.title }}</p>
      <p class="user-institution">🏛️ {{ store.currentUser.institution }}</p>

      <p class="user-bio">{{ store.currentUser.bio }}</p>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ store.articles.length }}</span>
          <span class="stat-label">Artykuły</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalLikes }}</span>
          <span class="stat-label">Polubienia</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.savedArticles.length }}</span>
          <span class="stat-label">Zapisane</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.profile-card {
  overflow: hidden;
  position: sticky;
  top: 76px;
}

.cover-banner {
  height: 68px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
}

.profile-body {
  padding: 0 18px 20px;
  text-align: center;
}

.avatar {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--bg-card);
  margin-top: -38px;
  background: var(--bg-subtle);
}

.user-name {
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.user-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--primary);
  margin-top: 2px;
}

.user-institution {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 6px;
}

.user-bio {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  text-align: left;
  line-height: 1.45;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-main);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>