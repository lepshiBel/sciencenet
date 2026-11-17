<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Article, ArticlePayload, ScienceField } from '../types/article';
import { SCIENCE_FIELDS } from '../data/mockArticles';

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
const content = ref('');
const imageUrl = ref('');
const errorMsg = ref('');

// Populate form fields when switching to edit mode or resetting
watch(
  () => props.editingArticle,
  (article) => {
    errorMsg.value = '';
    if (article) {
      title.value = article.title;
      author.value = article.author;
      field.value = article.field;
      content.value = article.content;
      imageUrl.value = article.imageUrl || '';
    } else {
      title.value = '';
      author.value = props.defaultAuthor || '';
      field.value = 'Informatyka';
      content.value = '';
      imageUrl.value = '';
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (!title.value.trim() || !content.value.trim()) {
    errorMsg.value = 'Tytuł oraz treść artykułu są wymagane.';
    return;
  }

  emit('submit', {
    title: title.value.trim(),
    author: author.value.trim() || props.defaultAuthor || 'Anonimowy badacz',
    field: field.value,
    content: content.value.trim(),
    imageUrl: imageUrl.value.trim() || undefined,
  });

  // Reset form after adding a new article
  if (!props.editingArticle) {
    title.value = '';
    content.value = '';
    imageUrl.value = '';
    errorMsg.value = '';
  }
};
</script>

<template>
  <form class="card article-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h3>
        {{ editingArticle ? '✏️ Edytuj artykuł naukowy' : '✍️ Opublikuj nowy artykuł' }}
      </h3>
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
      ⚠️ {{ errorMsg }}
    </div>

    <div class="form-row">
      <div class="form-group flex-2">
        <label for="art-title">Tytuł artykułu *</label>
        <input
          id="art-title"
          v-model="title"
          type="text"
          placeholder="Np. Wpływ grawitacji kwantowej na..."
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
        <label for="art-author">Autor</label>
        <input
          id="art-author"
          v-model="author"
          type="text"
          placeholder="Imię i nazwisko lub tytuł naukowy"
        />
      </div>

      <div class="form-group flex-1">
        <label for="art-image">Adres URL obrazka (opcjonalnie)</label>
        <input
          id="art-image"
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="art-content">Treść publikacji *</label>
      <textarea
        id="art-content"
        v-model="content"
        rows="4"
        placeholder="Podziel się wynikami badań, przemyśleniami lub streszczeniem artykułu..."
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
        {{ editingArticle ? 'Zapisz zmiany' : 'Opublikuj na tablicy' }}
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

.form-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.cancel-link {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-decoration: underline;
}

.error-banner {
  background: var(--danger-soft);
  color: var(--danger);
  border: 1px solid #fecaca;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.92rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
}

.form-group textarea {
  resize: vertical;
  min-height: 90px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn {
  padding: 9px 18px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
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

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--border);
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
  }
}
</style>