<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useArticleStore } from '../stores/useArticleStore';

const store = useArticleStore();
const router = useRouter();
const route = useRoute();

const handleSearchInput = () => {
  if (route.path !== '/') {
    router.push('/');
  }
};

const resetAndGoHome = () => {
  store.searchQuery = '';
  store.selectedField = 'ALL';
};
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand" @click="resetAndGoHome">
        <span class="brand-icon">🔬</span>
        <span class="brand-name">Science<span>Net</span></span>
      </RouterLink>

      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="Szukaj artykułu po tytule..."
          aria-label="Szukaj artykułu po tytule"
          @input="handleSearchInput"
        />
        <button
          v-if="store.searchQuery"
          type="button"
          class="clear-btn"
          title="Wyczyść wyszukiwanie"
          @click="store.searchQuery = ''"
        >
          ✕
        </button>
      </div>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-link" active-class="active">
          <span>📰</span>
          <span class="nav-text">Tablica</span>
        </RouterLink>

        <RouterLink to="/saved" class="nav-link" active-class="active">
          <span>🔖</span>
          <span class="nav-text">Zapisane</span>
          <span v-if="store.savedArticles.length > 0" class="badge">
            {{ store.savedArticles.length }}
          </span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 1.4rem;
}

.brand-name span {
  color: var(--primary);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 0.9rem;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 8px 32px 8px 36px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.92rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 2px 6px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-secondary);
  transition: background-color 0.2s, color 0.2s;
}

.nav-link:hover {
  background: var(--bg-subtle);
  color: var(--text-main);
}

.nav-link.active {
  background: var(--primary-soft);
  color: var(--primary);
}

.badge {
  background: var(--primary);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}

@media (max-width: 680px) {
  .header-inner {
    flex-wrap: wrap;
    gap: 10px;
  }

  .search-box {
    order: 3;
    max-width: 100%;
    flex-basis: 100%;
  }

  .nav-link {
    padding: 6px 10px;
  }
}
</style>