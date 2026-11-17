<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Article } from '../types/article';
import { FIELD_STYLES } from '../data/mockArticles';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';
import RichTextRenderer from './RichTextRenderer.vue';

const props = defineProps<{
  article: Article;
  activeTag?: string | null;
  activeAuthor?: string | null;
}>();

const emit = defineEmits<{
  (e: 'toggle-like', id: string): void;
  (e: 'toggle-save', id: string): void;
  (e: 'edit', article: Article): void;
  (e: 'delete', id: string): void;
  (e: 'open-reader', article: Article): void;
  (e: 'cite', article: Article): void;
  (e: 'select-tag', tag: string): void;
  (e: 'select-author', author: string): void;
  (e: 'add-comment', payload: { articleId: string; text: string }): void;
}>();

const store = useArticleStore();
const showComments = ref(false);
const newCommentText = ref('');
const imageLoadError = ref(false);

const editingCommentId = ref<string | null>(null);
const editingCommentText = ref('');

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

const splitAuthorName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { prefix: '', lastWord: fullName.trim() };
  }
  const lastWord = parts.pop() || '';
  return { prefix: parts.join(' ') + ' ', lastWord };
};

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

const startEditComment = (commentId: string, currentText: string) => {
  editingCommentId.value = commentId;
  editingCommentText.value = currentText;
};

const saveEditComment = (commentId: string) => {
  if (!editingCommentText.value.trim()) return;
  store.updateComment(props.article.id, commentId, editingCommentText.value);
  editingCommentId.value = null;
  editingCommentText.value = '';
};

const removeComment = (commentId: string) => {
  store.deleteComment(props.article.id, commentId);
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
        <button
          type="button"
          class="author-link"
          :class="{ active: activeAuthor?.toLowerCase() === article.author.toLowerCase() }"
          title="Pokaż publikacje tego autora"
          @click="emit('select-author', article.author)"
        >
          <span>{{ splitAuthorName(article.author).prefix }}</span>
          <span class="author-tail">
            {{ splitAuthorName(article.author).lastWord }}
            <span
              v-if="article.isVerifiedAuthor"
              class="verified-mini"
              title="Zweryfikowany autor"
            >
              <AppIcon name="check" :size="9" />
            </span>
          </span>
        </button>
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
          @click="emit('delete', article.id)"
        >
          <AppIcon name="trash" :size="14" />
        </button>
      </div>
    </div>

    <h2 class="article-title" @click="emit('open-reader', article)">
      {{ article.title }}
    </h2>

    <div class="article-content">
      <RichTextRenderer :content="article.content" />
    </div>

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

        <button
          type="button"
          class="action-btn"
          title="Generuj cytowanie APA / BibTeX"
          @click="emit('cite', article)"
        >
          <AppIcon name="quote" :size="14" />
          <span>Cytuj</span>
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
            <div class="comment-meta-right">
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              <template v-if="comment.isOwn">
                <button
                  type="button"
                  class="mini-icon-btn"
                  title="Edytuj komentarz"
                  @click="startEditComment(comment.id, comment.text)"
                >
                  <AppIcon name="edit" :size="12" />
                </button>
                <button
                  type="button"
                  class="mini-icon-btn danger"
                  title="Usuń komentarz"
                  @click="removeComment(comment.id)"
                >
                  <AppIcon name="trash" :size="12" />
                </button>
              </template>
            </div>
          </div>

          <div v-if="editingCommentId === comment.id" class="comment-edit-row">
            <input
              v-model="editingCommentText"
              type="text"
              @keyup.enter="saveEditComment(comment.id)"
            />
            <button
              type="button"
              class="btn-xs-save"
              @click="saveEditComment(comment.id)"
            >
              Zapisz
            </button>
            <button
              type="button"
              class="btn-xs-cancel"
              @click="editingCommentId = null"
            >
              Anuluj
            </button>
          </div>

          <p v-else class="comment-text">{{ comment.text }}</p>
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

.author-link {
  display: inline;
  background: none;
  border: none;
  padding: 0;
  font-weight: 600;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--text-main);
  text-align: left;
  transition: color 0.15s;
}

.author-link:hover,
.author-link.active {
  color: var(--primary);
  text-decoration: underline;
}

.author-tail {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.verified-mini {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

[data-theme='dark'] .verified-mini {
  color: #0f1117;
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
}

.article-image-wrapper {
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  cursor: zoom-in;
}

.article-image-wrapper img {
  width: 100%;
  height: auto;
  max-height: 360px;
  object-fit: cover;
  display: block;
}

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
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.82rem;
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

.comment-meta-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.comment-date {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.mini-icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  padding: 2px;
}

.mini-icon-btn:hover {
  color: var(--text-main);
}

.mini-icon-btn.danger:hover {
  color: var(--danger);
}

.comment-edit-row {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.comment-edit-row input {
  flex: 1;
  padding: 5px 9px;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 0.84rem;
}

.btn-xs-save,
.btn-xs-cancel {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 600;
}

.btn-xs-save {
  background: var(--primary);
  border: none;
  color: #ffffff;
}

[data-theme='dark'] .btn-xs-save {
  color: #0f1117;
}

.btn-xs-cancel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
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