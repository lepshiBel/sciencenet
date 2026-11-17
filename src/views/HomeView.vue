<script setup lang="ts">
import { useArticleStore } from '../stores/useArticleStore';

const store = useArticleStore();
</script>

<template>
  <section class="feed-placeholder card">
    <h2>Tablica naukowa</h2>
    <p>Załadowano artykułów: {{ store.filteredArticles.length }}</p>
  </section>
</template>

<style scoped>
.feed-placeholder {
  padding: 24px;
}
</style>