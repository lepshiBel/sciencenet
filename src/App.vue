<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import UserProfileSidebar from './components/UserProfileSidebar.vue';
import PopularArticlesSidebar from './components/PopularArticlesSidebar.vue';
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="container main-grid">
      <div class="left-col">
        <UserProfileSidebar />
      </div>

      <div class="center-col">
        <RouterView />
      </div>

      <div class="right-col">
        <PopularArticlesSidebar />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-grid {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 280px;
  gap: 20px;
  padding-top: 22px;
  padding-bottom: 40px;
  align-items: start;
}

.center-col {
  min-width: 0; /* Prevents flex/grid blowout from long words or URLs */
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 16px;
  }
}
</style>