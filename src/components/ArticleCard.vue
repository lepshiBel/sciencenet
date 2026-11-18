<script setup lang="ts">
import { computed } from 'vue';
import type { Article } from '../types/article';
import { FIELD_STYLES } from '../data/mockArticles';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';
import RichTextRenderer from './RichTextRenderer.vue';

const props = defineProps<{
  article: Article;
  activeAuthor?: string | null;
}>();

const emit = defineEmits<{
  (e: 'toggle-like', id: string): void;
  (e: 'toggle-save', id: string): void;
  (e: 'edit', article: Article): void;
  (e: 'delete', id: string): void;
  (e: 'read', article: Article): void;
  (e: 'cite', article: Article): void;
  (e: 'select-tag', tag: string): void;
  (e: 'select-author', author: string): void;
}>();

const store = useArticleStore();

// Only the author of the publication can edit or delete it
const canManage = computed(() => {
  return (
    Boolean(props.article.isOwn) ||
    props.article.author.trim().toLowerCase() ===
      store.currentUser.name.trim().toLowerCase()
  );
});

const fieldBadgeStyle = computed(() => {
  const token = FIELD_STYLES[props.article.field];
  return {
    backgroundColor: token.bg,
    color: token.text,
    borderColor: token.border,
  };
});

// Keep the last word of the author's name bound to the verification badge
const splitAuthorName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { prefix: '', lastWord: fullName.trim() };
  }
  const lastWord = parts.pop() || '';
  return { prefix: parts.join(' ') + ' ', lastWord };
};

const readingMinutes = computed(() => {
  const words = props.article.content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
});

const formatDate = (isoString: string): string => {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
};
</script>

<template>
  <article class="card article-card">
    <!-- Top Meta Bar -->
    <div class="card-header">
      <div class="meta-info">
        <span class="field-badge" :style="fieldBadgeStyle">
          {{ article.field }}
        </span>

        <span class="type-pill">{{ article.publicationType }}</span>

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

        <span v-if="canManage" class="own-badge">Twoja praca</span>

        <span class="dot">•</span>
        <time class="date" :datetime="article.createdAt">
          {{ formatDate(article.createdAt) }}
        </time>
        <span class="dot">•</span>
        <span class="read-time" title="Szacowany czas czytania">
          <AppIcon name="clock" :size="12" />
          {{ readingMinutes }} min
        </span>
      </div>

      <!-- Bookmark & Owner-Only Controls -->
      <div class="card-controls">
        <button
          type="button"
          class="icon-btn save-btn"
          :class="{ saved: article.isSaved }"
          :title="article.isSaved ? 'Usuń z czytelni' : 'Zapisz w czytelni'"
          @click="emit('toggle-save', article.id)"
        >
          <AppIcon
            :name="article.isSaved ? 'bookmark-filled' : 'bookmark'"
            :size="14"
          />
          <span>{{ article.isSaved ? 'Zapisano' : 'Zapisz' }}</span>
        </button>

        <template v-if="canManage">
          <button
            type="button"
            class="icon-btn"
            title="Edytuj swoją publikację"
            @click="emit('edit', article)"
          >
            <AppIcon name="edit" :size="14" />
          </button>

          <button
            type="button"
            class="icon-btn danger"
            title="Usuń swoją publikację"
            @click="emit('delete', article.id)"
          >
            <AppIcon name="trash" :size="14" />
          </button>
        </template>
      </div>
    </div>

    <!-- Article Title (Clickable to open Reader Mode) -->
    <h2 class="article-title" @click="emit('read', article)">
      {{ article.title }}
    </h2>

    <!-- Rich Scientific Body (Equations, Code blocks, Quotes, Text) -->
    <div class="article-body">
      <RichTextRenderer :content="article.content" />
    </div>

    <!-- Private Researcher Note (if present) -->
    <div
      v-if="article.personalNote"
      class="card-note-preview"
      title="Kliknij, aby edytować notatkę w trybie czytania"
      @click="emit('read', article)"
    >
      <span class="note-badge">Notatka:</span>
      <span>{{ article.personalNote }}</span>
    </div>

    <!-- Optional Figure / Image -->
    <div v-if="article.imageUrl" class="article-image" @click="emit('read', article)">
      <img :src="article.imageUrl" :alt="article.title" loading="lazy" />
    </div>

    <!-- Interactive Tags -->
    <div v-if="article.tags && article.tags.length > 0" class="article-tags">
      <button
        v-for="tag in article.tags"
        :key="tag"
        type="button"
        class="tag-pill"
        @click="emit('select-tag', tag)"
      >
        #{{ tag }}
      </button>
    </div>

    <!-- Action Bar -->
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
          <span class="counter">{{ article.likes }}</span>
        </button>

        <button
          type="button"
          class="action-btn"
          @click="emit('read', article)"
        >
          <AppIcon name="comment" :size="15" />
          <span>Komentarze</span>
          <span class="counter">{{ article.comments.length }}</span>
        </button>

        <button
          type="button"
          class="action-btn"
          title="Generuj cytowanie APA lub BibTeX"
          @click="emit('cite', article)"
        >
          <AppIcon name="quote" :size="14" />
          <span>Cytuj</span>
        </button>
      </div>

      <button
        type="button"
        class="read-more-btn"
        @click="emit('read', article)"
      >
        <AppIcon name="book-open" :size="14" />
        <span>Tryb czytania</span>
      </button>
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

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.meta-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.field-badge {
  font-weight: 700;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  letter-spacing: 0.01em;
}

.type-pill {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.own-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  color: var(--primary);
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

.dot {
  color: var(--border-strong);
}

.date,
.read-time {
  font-family: var(--font-mono);
  font-size: 0.74rem;
}

.read-time {
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
  padding: 5px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
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

.icon-btn.danger:hover {
  background: var(--danger-soft);
  border-color: var(--danger-border);
  color: var(--danger);
}

.article-title {
  font-family: var(--font-serif);
  font-size: 1.38rem;
  font-weight: 600;
  line-height: 1.32;
  color: var(--text-main);
  cursor: pointer;
  transition: color 0.15s;
}

.article-title:hover {
  color: var(--primary);
}

.article-body {
  font-size: 0.94rem;
  line-height: 1.65;
  color: var(--text-secondary);
}

.card-note-preview {
  padding: 8px 12px;
  border-left: 3px solid var(--primary);
  background: var(--primary-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 0.84rem;
  color: var(--text-main);
  cursor: pointer;
  transition: background-color 0.15s;
}

.card-note-preview:hover {
  background: var(--bg-hover);
}

.note-badge {
  font-weight: 700;
  color: var(--primary);
  margin-right: 6px;
}

.article-image {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  cursor: pointer;
}

.article-image img {
  width: 100%;
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
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}

.tag-pill:hover {
  border-color: var(--primary-border);
  background: var(--primary-soft);
  color: var(--primary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 12px;
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
  font-size: 0.82rem;
  font-weight: 600;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
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

.counter {
  font-family: var(--font-mono);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.82rem;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
}

.read-more-btn:hover {
  background: var(--primary-soft);
}
</style>