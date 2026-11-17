<script setup lang="ts">
import type { ScienceField } from '../types/article';
import { SCIENCE_FIELDS } from '../data/mockArticles';

defineProps<{
  selected: ScienceField | 'ALL';
}>();

const emit = defineEmits<{
  (e: 'select', field: ScienceField | 'ALL'): void;
}>();
</script>

<template>
  <div class="filter-bar card" role="region" aria-label="Filtruj po dziedzinie nauki">
    <button
      type="button"
      class="filter-chip"
      :class="{ active: selected === 'ALL' }"
      @click="emit('select', 'ALL')"
    >
      Wszystkie dziedziny
    </button>

    <button
      v-for="field in SCIENCE_FIELDS"
      :key="field"
      type="button"
      class="filter-chip"
      :class="{ active: selected === field }"
      @click="emit('select', field)"
    >
      {{ field }}
    </button>
  </div>
</template>

<style scoped>
.filter-bar {
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--border);
  color: var(--text-main);
}

.filter-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}
</style>