<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();
const router = useRouter();
const route = useRoute();

const handleSearchInput = () => {
  if (route.path !== '/') {
    router.push('/');
  }
};

const resetAndGoHome = () => {
  store.resetFilters();
};
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand" @click="resetAndGoHome">
        <span class="brand-badge">
          <AppIcon name="atom" :size="18" />
        </span>
        <span class="brand-name">Science<span>Net</span></span>
      </RouterLink>

      <div class="search-box">
        <span class="search-icon">
          <AppIcon name="search" :size="15" />
        </span>
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="Szukaj po tytule lub tagu..."
          aria-label="Szukaj po tytule lub tagu"
          @input="handleSearchInput"
        />
        <button
          v-if="store.searchQuery"
          type="button"
          class="clear-btn"
          title="Wyczyść wyszukiwanie"
          @click="store.searchQuery = ''"
        >
          <AppIcon name="close" :size="14" />
        </button>
      </div>

      <div class="header-right">
        <nav class="nav-links">
          <RouterLink to="/" class="nav-link" active-class="active">
            <AppIcon name="feed" :size="16" />
            <span class="nav-text">Tablica</span>
          </RouterLink>

          <RouterLink to="/saved" class="nav-link" active-class="active">
            <AppIcon name="bookmark" :size="16" />
            <span class="nav-text">Zapisane</span>
            <span v-if="store.savedArticles.length > 0" class="badge">
              {{ store.savedArticles.length }}
            </span>
          </RouterLink>
        </nav>

        <button
          type="button"
          class="theme-toggle"
          :title="store.theme === 'light' ? 'Przełącz na motyw ciemny' : 'Przełącz na motyw jasny'"
          :aria-label="store.theme === 'light' ? 'Motyw ciemny' : 'Motyw jasny'"
          @click="store.toggleTheme"
        >
          <AppIcon :name="store.theme === 'light' ? 'moon' : 'sun'" :size="16" />
        </button>
      </div>
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
  gap: 10px;
  font-weight: 700;
  font-size: 1.18rem;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.brand-badge {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

[data-theme='dark'] .brand-badge {
  color: #0f1117;
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
  color: var(--text-muted);
  display: inline-flex;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 8px 32px 8px 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.9rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  padding: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text-secondary);
  transition: background-color 0.2s, color 0.2s;
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.nav-link.active {
  background: var(--primary-soft);
  color: var(--primary);
}

.badge {
  font-family: var(--font-mono);
  background: var(--primary);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
}

[data-theme='dark'] .badge {
  color: #0f1117;
}

.theme-toggle {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  border-color: var(--border-strong);
}

@media (max-width: 720px) {
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