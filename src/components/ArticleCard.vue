<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Article } from '../types/article';

const props = defineProps<{
  article: Article;
}>();

const emit = defineEmits<{
  (e: 'toggle-like', id: string): void;
  (e: 'toggle-save', id: string): void;
  (e: 'edit', article: Article): void;
  (e: 'delete', id: string): void;
  (e: 'add-comment', payload: { articleId: string; text: string }): void;
}>();

const showComments = ref(false);
const newCommentText = ref('');
const imageLoadError = ref(false);

// Reset image error flag if the user edits the article and provides a new URL
watch(
  () => props.article.imageUrl,
  () => {
    imageLoadError.value = false;
  }
);

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
  if (confirm(`Czy na pewno chcesz usunąć artykuł "${props.article.title}"?`)) {
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
        <span class="field-badge">{{ article.field }}</span>
        <span class="author-name">{{ article.author }}</span>
        <span class="dot">•</span>
        <time :datetime="article.createdAt" class="publish-date">
          {{ formatDate(article.createdAt) }}
        </time>
      </div>

      <div class="card-controls">
        <button
          type="button"
          class="icon-btn"
          :class="{ saved: article.isSaved }"
          :title="article.isSaved ? 'Usuń z zapisanych' : 'Zapisz artykuł'"
          @click="emit('toggle-save', article.id)"
        >
          {{ article.isSaved ? '🔖 Zapisano' : '📑 Zapisz' }}
        </button>

        <button
          type="button"
          class="icon-btn"
          title="Edytuj artykuł"
          @click="emit('edit', article)"
        >
          ✏️
        </button>

        <button
          type="button"
          class="icon-btn delete-btn"
          title="Usuń artykuł"
          @click="handleDelete"
        >
          🗑️
        </button>
      </div>
    </div>

    <h2 class="article-title">{{ article.title }}</h2>

    <p class="article-content">{{ article.content }}</p>

    <div
      v-if="article.imageUrl && !imageLoadError"
      class="article-image-wrapper"
    >
      <img
        :src="article.imageUrl"
        :alt="article.title"
        loading="lazy"
        @error="imageLoadError = true"
      />
    </div>

    <div class="card-footer">
      <button
        type="button"
        class="action-btn"
        :class="{ liked: article.isLiked }"
        @click="emit('toggle-like', article.id)"
      >
        <span>👍</span>
        <span>Lubię to</span>
        <span class="count-pill">{{ article.likes }}</span>
      </button>

      <button
        type="button"
        class="action-btn"
        @click="showComments = !showComments"
      >
        <span>💬</span>
        <span>Komentarze</span>
        <span class="count-pill">{{ article.comments.length }}</span>
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
        Brak komentarzy. Bądź pierwszą osobą, która skomentuje ten artykuł!
      </p>

      <form class="comment-form" @submit.prevent="submitComment">
        <input
          v-model="newCommentText"
          type="text"
          placeholder="Napisz komentarz naukowy..."
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s;
}

.article-card:hover {
  border-color: #cbd5e1;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--text-secondary);
}

.field-badge {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 700;
  font-size: 0.76rem;
  padding: 3px 9px;
  border-radius: 999px;
}

.author-name {
  font-weight: 600;
  color: var(--text-main);
}

.dot,
.publish-date {
  color: var(--text-muted);
}

.card-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.icon-btn:hover {
  background: var(--border);
  color: var(--text-main);
}

.icon-btn.saved {
  background: var(--primary-soft);
  border-color: #bfdbfe;
  color: var(--primary);
}

.icon-btn.delete-btn:hover {
  background: var(--danger-soft);
  border-color: #fecaca;
  color: var(--danger);
}

.article-title {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-main);
}

.article-content {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
}

.article-image-wrapper {
  margin-top: 4px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
}

.article-image-wrapper img {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  display: block;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid var(--border);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--border);
  color: var(--text-main);
}

.action-btn.liked {
  background: var(--primary-soft);
  border-color: #93c5fd;
  color: var(--primary);
}

.count-pill {
  background: rgba(15, 23, 42, 0.06);
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.78rem;
}

.action-btn.liked .count-pill {
  background: rgba(29, 78, 216, 0.14);
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
  font-size: 0.84rem;
  color: var(--text-main);
}

.comment-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.no-comments {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.comment-form {
  display: flex;
  gap: 8px;
}

.comment-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  font-size: 0.88rem;
}

.comment-form input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
}

.comment-form button {
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
}

.comment-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>