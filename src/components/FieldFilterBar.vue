<script setup lang="ts">
import type { ScienceField, SortOption } from '../types/article';
import { SCIENCE_FIELDS, FIELD_STYLES } from '../data/mockArticles';
import AppIcon from './AppIcon.vue';

defineProps<{
  selected: ScienceField | 'ALL';
  selectedTag: string | null;
  selectedAuthor: string | null;
  onlyMine: boolean;
  sortBy: SortOption;
}>();

const emit = defineEmits<{
  (e: 'select', field: ScienceField | 'ALL'): void;
  (e: 'clear-tag'): void;
  (e: 'clear-author'): void;
  (e: 'toggle-mine'): void;
  (e: 'update:sortBy', value: SortOption): void;
}>();

const getActiveChipStyle = (field: ScienceField) => {
  const token = FIELD_STYLES[field];
  return {
    backgroundColor: token.bg,
    color: token.text,
    borderColor: token.border,
  };
};
</script>

<template>
  <div class="filter-panel card" role="region" aria-label="Filtrowanie i sortowanie">
    <div class="fields-row">
      <button
        type="button"
        class="filter-chip"
        :class="{ 'active-all': selected === 'ALL' }"
        @click="emit('select', 'ALL')"
      >
        Wszystkie
      </button>

      <button
        v-for="field in SCIENCE_FIELDS"
        :key="field"
        type="button"
        class="filter-chip"
        :class="{ 'active-field': selected === field }"
        :style="selected === field ? getActiveChipStyle(field) : undefined"
        @click="emit('select', field)"
      >
        <span
          class="field-dot"
          :style="{ backgroundColor: FIELD_STYLES[field].text }"
        ></span>
        {{ field }}
      </button>
    </div>

    <div class="controls-row">
      <div class="active-badges">
        <button
          type="button"
          class="toggle-mine-btn"
          :class="{ active: onlyMine }"
          @click="emit('toggle-mine')"
        >
          <AppIcon name="user" :size="13" />
          <span>Moje publikacje</span>
        </button>

        <span v-if="selectedAuthor" class="active-filter-pill">
          <AppIcon name="user" :size="12" />
          <span>{{ selectedAuthor }}</span>
          <button
            type="button"
            title="Usuń filtr autora"
            @click="emit('clear-author')"
          >
            <AppIcon name="close" :size="12" />
          </button>
        </span>

        <span v-if="selectedTag" class="active-filter-pill mono">
          <span>#{{ selectedTag }}</span>
          <button
            type="button"
            title="Usuń filtr tagu"
            @click="emit('clear-tag')"
          >
            <AppIcon name="close" :size="12" />
          </button>
        </span>
      </div>

      <label class="sort-control">
        <span class="sort-label">Sortuj:</span>
        <select
          :value="sortBy"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as SortOption)"
        >
          <option value="newest">Najnowsze</option>
          <option value="popular">Najwięcej polubień</option>
          <option value="discussed">Najwięcej komentarzy</option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fields-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
}

.filter-chip:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.filter-chip.active-all {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.filter-chip.active-field {
  font-weight: 700;
}

.field-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.active-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-mine-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.15s;
}

.toggle-mine-btn:hover {
  background: var(--bg-hover);
}

.toggle-mine-btn.active {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.active-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 600;
}

.active-filter-pill.mono {
  font-family: var(--font-mono);
}

.active-filter-pill button {
  background: none;
  border: none;
  color: inherit;
  display: inline-flex;
  padding: 1px;
}

.sort-control {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.sort-control select {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.8rem;
  font-weight: 600;
}

.sort-control select:focus {
  outline: none;
  border-color: var(--primary);
}
</style>