<script setup lang="ts">
import { useArticleStore } from '../stores/useArticleStore';

const store = useArticleStore();
</script>

<template>
  <section class="saved-placeholder card">
    <h2>Zapisane artykuły ({{ store.savedArticles.length }})</h2>
  </section>
</template>

<style scoped>
.saved-placeholder {
  padding: 24px;
}
</style>