<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Article } from '../types/article';
import { FIELD_STYLES } from '../data/mockArticles';
import AppIcon from './AppIcon.vue';

const props = defineProps<{
  article: Article;
  activeTag?: string | null;
}>();

const emit = defineEmits<{
  (e: 'toggle-like', id: string): void;
  (e: 'toggle-save', id: string): void;
  (e: 'edit', article: Article): void;
  (e: 'delete', id: string): void;
  (e: 'open-reader', article: Article): void;
  (e: 'select-tag', tag: string): void;
  (e: 'add-comment', payload: { articleId: string; text: string }): void;
}>();

const showComments = ref(false);
const newCommentText = ref('');
const imageLoadError = ref(false);

watch(
  () => props.article.imageUrl,
  () => {
    imageLoadError.value = false;
  }
);

const fieldBadgeStyle = computed(() => {
  const token = FIELD_STYLES[props.article.field];
  return {
    backgroundColor: token.bg,
    color: token.text,
    borderColor: token.border,
  };
});

// Deterministic academic tag color index (0..4) based on tag text
const getTagToneClass = (tag: string): string => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `tag-tone-${Math.abs(hash) % 5}`;
};

const readingMinutes = computed(() => {
  const words = props.article.content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
});

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const handleDelete = () => {
  if (confirm(`Czy na pewno chcesz usunąć publikację „${props.article.title}”?`)) {
    emit('delete', props.article.id);
  }
};

const submitComment = () => {
  const text = newCommentText.value.trim();
  if (!text) return;

  emit('add-comment', {
    articleId: props.article.id,
    text,
  });
  newCommentText.value = '';
  showComments.value = true;
};
</script>

<template>
  <article class="card article-card">
    <div class="card-top">
      <div class="meta-left">
        <span class="field-badge" :style="fieldBadgeStyle">
          {{ article.field }}
        </span>
        <span class="type-badge">{{ article.publicationType }}</span>
        <span class="author-name">{{ article.author }}</span>
        <span class="dot">•</span>
        <time :datetime="article.createdAt" class="publish-date">
          {{ formatDate(article.createdAt) }}
        </time>
        <span class="dot">•</span>
        <span class="read-time">
          <AppIcon name="clock" :size="12" />
          {{ readingMinutes }} min
        </span>
      </div>

      <div class="card-controls">
        <button
          type="button"
          class="icon-btn"
          :class="{ saved: article.isSaved }"
          :title="article.isSaved ? 'Usuń z zapisanych' : 'Zapisz w czytelni'"
          @click="emit('toggle-save', article.id)"
        >
          <AppIcon
            :name="article.isSaved ? 'bookmark-filled' : 'bookmark'"
            :size="14"
          />
          <span>{{ article.isSaved ? 'Zapisano' : 'Zapisz' }}</span>
        </button>

        <button
          type="button"
          class="icon-btn icon-only"
          title="Edytuj publikację"
          @click="emit('edit', article)"
        >
          <AppIcon name="edit" :size="14" />
        </button>

        <button
          type="button"
          class="icon-btn icon-only delete-btn"
          title="Usuń publikację"
          @click="handleDelete"
        >
          <AppIcon name="trash" :size="14" />
        </button>
      </div>
    </div>

    <h2 class="article-title" @click="emit('open-reader', article)">
      {{ article.title }}
    </h2>

    <p class="article-content">{{ article.content }}</p>

    <div
      v-if="article.imageUrl && !imageLoadError"
      class="article-image-wrapper"
      @click="emit('open-reader', article)"
    >
      <img
        :src="article.imageUrl"
        :alt="article.title"
        loading="lazy"
        @error="imageLoadError = true"
      />
    </div>

    <div v-if="article.tags && article.tags.length > 0" class="article-tags">
      <button
        v-for="tag in article.tags"
        :key="tag"
        type="button"
        class="tag-pill"
        :class="[getTagToneClass(tag), { active: activeTag === tag }]"
        @click="emit('select-tag', tag)"
      >
        #{{ tag }}
      </button>
    </div>

    <div class="card-footer">
      <div class="footer-left">
        <button
          type="button"
          class="action-btn"
          :class="{ liked: article.isLiked }"
          @click="emit('toggle-like', article.id)"
        >
          <AppIcon name="thumbs-up" :size="15" />
          <span>Lubię to</span>
          <span class="count-pill">{{ article.likes }}</span>
        </button>

        <button
          type="button"
          class="action-btn"
          @click="showComments = !showComments"
        >
          <AppIcon name="comment" :size="15" />
          <span>Komentarze</span>
          <span class="count-pill">{{ article.comments.length }}</span>
        </button>
      </div>

      <button
        type="button"
        class="read-more-btn"
        @click="emit('open-reader', article)"
      >
        <AppIcon name="book-open" :size="14" />
        <span>Tryb czytania</span>
      </button>
    </div>

    <!-- Expandable Comments Section -->
    <div v-if="showComments" class="comments-section">
      <ul v-if="article.comments.length > 0" class="comments-list">
        <li
          v-for="comment in article.comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-text">{{ comment.text }}</p>
        </li>
      </ul>

      <p v-else class="no-comments">
        Brak komentarzy. Rozpocznij dyskusję naukową pod tą publikacją.
      </p>

      <form class="comment-form" @submit.prevent="submitComment">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Dodaj merytoryczny komentarz..."
        />
        <button type="submit" :disabled="!newCommentText.trim()">
          Wyślij
        </button>
      </form>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s;
}

.article-card:hover {
  border-color: var(--border-strong);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: nowrap;
}

.meta-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.field-badge {
  font-weight: 700;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  letter-spacing: 0.01em;
}

.type-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.author-name {
  font-weight: 600;
  color: var(--text-main);
}

.dot,
.publish-date,
.read-time {
  color: var(--text-muted);
}

.read-time {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 5px 9px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.icon-btn.icon-only {
  padding: 5px 7px;
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  border-color: var(--border-strong);
}

.icon-btn.saved {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.icon-btn.delete-btn:hover {
  background: var(--danger-soft);
  border-color: var(--danger-border);
  color: var(--danger);
}

.article-title {
  font-family: var(--font-serif);
  font-size: 1.32rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-main);
  cursor: pointer;
  transition: color 0.15s;
}

.article-title:hover {
  color: var(--primary);
}

.article-content {
  font-size: 0.93rem;
  color: var(--text-secondary);
  line-height: 1.65;
  white-space: pre-line;
}

.article-image-wrapper {
  margin-top: 2px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  cursor: zoom-in;
}

.article-image-wrapper img {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  display: block;
}

/* Academic Muted Tag Tones */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-pill {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: transform 0.1s, filter 0.15s;
}

.tag-pill:hover {
  filter: brightness(0.95);
}

.tag-pill.active {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}

.tag-tone-0 {
  background: var(--field-astro-bg);
  color: var(--field-astro-text);
  border-color: var(--field-astro-border);
}

.tag-tone-1 {
  background: var(--field-bio-bg);
  color: var(--field-bio-text);
  border-color: var(--field-bio-border);
}

.tag-tone-2 {
  background: var(--field-phys-bg);
  color: var(--field-phys-text);
  border-color: var(--field-phys-border);
}

.tag-tone-3 {
  background: var(--field-it-bg);
  color: var(--field-it-text);
  border-color: var(--field-it-border);
}

.tag-tone-4 {
  background: var(--field-chem-bg);
  color: var(--field-chem-text);
  border-color: var(--field-chem-border);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 12px;
  margin-top: 2px;
  border-top: 1px solid var(--border);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.84rem;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.action-btn.liked {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.count-pill {
  font-family: var(--font-mono);
  background: rgba(128, 128, 128, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 0.74rem;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 6px;
}

.read-more-btn:hover {
  text-decoration: underline;
}

/* Comments */
.comments-section {
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comments-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-item {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--text-main);
}

.comment-date {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.comment-text {
  font-size: 0.86rem;
  color: var(--text-secondary);
}

.no-comments {
  font-size: 0.83rem;
  color: var(--text-muted);
  font-style: italic;
}

.comment-form {
  display: flex;
  gap: 8px;
}

.comment-form input {
  flex: 1;
  padding: 7px 11px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.85rem;
}

.comment-form input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
}

.comment-form button {
  padding: 7px 14px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.83rem;
}

[data-theme='dark'] .comment-form button {
  color: #0f1117;
}

.comment-form button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>