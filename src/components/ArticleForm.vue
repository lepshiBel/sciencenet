<script setup lang="ts">
import { ref, watch } from 'vue';
import type {
  Article,
  ArticlePayload,
  PublicationType,
  ScienceField,
} from '../types/article';
import { SCIENCE_FIELDS, PUBLICATION_TYPES } from '../data/mockArticles';
import AppIcon from './AppIcon.vue';

const props = defineProps<{
  editingArticle?: Article | null;
  defaultAuthor?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: ArticlePayload): void;
  (e: 'cancel'): void;
}>();

const title = ref('');
const author = ref(props.defaultAuthor || '');
const field = ref<ScienceField>('Informatyka');
const publicationType = ref<PublicationType>('Artykuł badawczy');
const tags = ref<string[]>([]);
const tagInput = ref('');
const content = ref('');
const imageUrl = ref('');
const errorMsg = ref('');

watch(
  () => props.editingArticle,
  (article) => {
    errorMsg.value = '';
    tagInput.value = '';
    if (article) {
      title.value = article.title;
      author.value = article.author;
      field.value = article.field;
      publicationType.value = article.publicationType || 'Artykuł badawczy';
      tags.value = [...(article.tags || [])];
      content.value = article.content;
      imageUrl.value = article.imageUrl || '';
    } else {
      title.value = '';
      author.value = props.defaultAuthor || '';
      field.value = 'Informatyka';
      publicationType.value = 'Artykuł badawczy';
      tags.value = [];
      content.value = '';
      imageUrl.value = '';
    }
  },
  { immediate: true }
);

const addTag = () => {
  const cleaned = tagInput.value
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-');

  if (cleaned && !tags.value.includes(cleaned) && tags.value.length < 6) {
    tags.value.push(cleaned);
  }
  tagInput.value = '';
};

const removeTag = (target: string) => {
  tags.value = tags.value.filter((t) => t !== target);
};

const handleTagKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag();
  }
};

const handleSubmit = () => {
  if (tagInput.value.trim()) {
    addTag();
  }

  if (!title.value.trim() || !content.value.trim()) {
    errorMsg.value = 'Tytuł oraz treść publikacji są wymagane.';
    return;
  }

  emit('submit', {
    title: title.value.trim(),
    author: author.value.trim() || props.defaultAuthor || 'Anonimowy badacz',
    field: field.value,
    publicationType: publicationType.value,
    tags: [...tags.value],
    content: content.value.trim(),
    imageUrl: imageUrl.value.trim() || undefined,
  });

  if (!props.editingArticle) {
    title.value = '';
    tags.value = [];
    tagInput.value = '';
    content.value = '';
    imageUrl.value = '';
    errorMsg.value = '';
  }
};
</script>

<template>
  <form class="card article-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <div class="header-title">
        <AppIcon :name="editingArticle ? 'edit' : 'plus'" :size="16" />
        <h3>
          {{ editingArticle ? 'Edycja publikacji naukowej' : 'Nowa publikacja naukowa' }}
        </h3>
      </div>

      <button
        v-if="editingArticle"
        type="button"
        class="cancel-link"
        @click="emit('cancel')"
      >
        Anuluj edycję
      </button>
    </div>

    <div v-if="errorMsg" class="error-banner">
      {{ errorMsg }}
    </div>

    <div class="form-row">
      <div class="form-group flex-2">
        <label for="art-title">Tytuł publikacji *</label>
        <input
          id="art-title"
          v-model="title"
          type="text"
          placeholder="Np. Analiza numeryczna układów dynamicznych..."
        />
      </div>

      <div class="form-group flex-1">
        <label for="art-field">Dziedzina nauki</label>
        <select id="art-field" v-model="field">
          <option v-for="item in SCIENCE_FIELDS" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group flex-1">
        <label for="art-type">Format pracy</label>
        <select id="art-type" v-model="publicationType">
          <option v-for="ptype in PUBLICATION_TYPES" :key="ptype" :value="ptype">
            {{ ptype }}
          </option>
        </select>
      </div>

      <div class="form-group flex-1">
        <label for="art-author">Autor</label>
        <input
          id="art-author"
          v-model="author"
          type="text"
          placeholder="Imię i nazwisko lub tytuł naukowy"
        />
      </div>

      <div class="form-group flex-1">
        <label for="art-image">URL ryciny / wykresu (opcjonalnie)</label>
        <input
          id="art-image"
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/figure.png"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="art-tags">Słowa kluczowe (wpisz i naciśnij Enter, maks. 6)</label>
      <div class="tags-input-wrapper">
        <span v-for="tag in tags" :key="tag" class="tag-chip">
          #{{ tag }}
          <button type="button" aria-label="Usuń tag" @click="removeTag(tag)">
            <AppIcon name="close" :size="11" />
          </button>
        </span>

        <input
          id="art-tags"
          v-model="tagInput"
          type="text"
          placeholder="np. symulacje, algorytmy, spektroskopia..."
          @keydown="handleTagKeydown"
          @blur="addTag"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="art-content">Abstrakt / Treść publikacji *</label>
      <textarea
        id="art-content"
        v-model="content"
        rows="4"
        placeholder="Przedstaw cel badań, metodologię oraz główne wnioski..."
      ></textarea>
    </div>

    <div class="form-actions">
      <button
        v-if="editingArticle"
        type="button"
        class="btn btn-secondary"
        @click="emit('cancel')"
      >
        Anuluj
      </button>
      <button type="submit" class="btn btn-primary">
        {{ editingArticle ? 'Zapisz zmiany' : 'Opublikuj' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.article-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
}

.header-title h3 {
  font-size: 1rem;
  font-weight: 700;
}

.cancel-link {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.82rem;
  text-decoration: underline;
}

.error-banner {
  background: var(--danger-soft);
  color: var(--danger);
  border: 1px solid var(--danger-border);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
  min-width: 0;
}

.flex-2 {
  flex: 2;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.88rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
}

.tags-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
}

.tags-input-wrapper:focus-within {
  border-color: var(--primary);
  background: var(--bg-card);
}

.tags-input-wrapper input {
  flex: 1;
  min-width: 140px;
  border: none;
  background: transparent;
  padding: 3px 4px;
  font-size: 0.86rem;
}

.tags-input-wrapper input:focus {
  outline: none;
}

.tag-chip {
  font-family: var(--font-mono);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 500;
}

.tag-chip button {
  background: none;
  border: none;
  color: inherit;
  display: inline-flex;
  padding: 1px;
}

.form-group textarea {
  resize: vertical;
  min-height: 88px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 2px;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.88rem;
  border: none;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: var(--primary);
  color: #ffffff;
}

[data-theme='dark'] .btn-primary {
  color: #0f1117;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

@media (max-width: 680px) {
  .form-row {
    flex-direction: column;
  }
}
</style>