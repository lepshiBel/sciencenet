<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import { FIELD_STYLES } from '../data/mockArticles';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();
const commentInput = ref('');

const article = computed(() => store.activeArticle);

// Lock background page scroll while the reader modal is open
watch(
  article,
  (isOpen) => {
    const overflowValue = isOpen ? 'hidden' : '';
    document.body.style.overflow = overflowValue;
    document.documentElement.style.overflow = overflowValue;
  },
  { immediate: true }
);

const fieldBadgeStyle = computed(() => {
  if (!article.value) return undefined;
  const token = FIELD_STYLES[article.value.field];
  return {
    backgroundColor: token.bg,
    color: token.text,
    borderColor: token.border,
  };
});

const formatDate = (isoString: string): string => {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
};

const closeModal = () => {
  store.activeArticle = null;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.activeArticle) {
    closeModal();
  }
};

const handleAddComment = () => {
  if (!article.value || !commentInput.value.trim()) return;
  store.addComment(article.value.id, commentInput.value);
  commentInput.value = '';
};

onMounted(() => window.addEventListener('keydown', handleKeydown));

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="article"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
    >
      <div class="modal-sheet card">
        <div class="modal-topbar">
          <div class="modal-badges">
            <span class="field-badge" :style="fieldBadgeStyle">
              {{ article.field }}
            </span>
            <span class="type-badge">{{ article.publicationType }}</span>
          </div>

          <button
            type="button"
            class="close-modal-btn"
            aria-label="Zamknij tryb czytania"
            @click="closeModal"
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <div class="modal-scroll">
          <h1 class="reader-title">{{ article.title }}</h1>

          <div class="reader-meta">
            <span class="reader-author">{{ article.author }}</span>
            <span>•</span>
            <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
          </div>

          <div v-if="article.imageUrl" class="reader-figure">
            <img :src="article.imageUrl" :alt="article.title" />
          </div>

          <div class="reader-body">
            {{ article.content }}
          </div>

          <div v-if="article.tags.length > 0" class="reader-tags">
            <span v-for="tag in article.tags" :key="tag" class="reader-tag">
              #{{ tag }}
            </span>
          </div>

          <div class="reader-actions">
            <button
              type="button"
              class="action-btn"
              :class="{ liked: article.isLiked }"
              @click="store.toggleLike(article.id)"
            >
              <AppIcon name="thumbs-up" :size="16" />
              <span>Lubię to ({{ article.likes }})</span>
            </button>

            <button
              type="button"
              class="action-btn"
              :class="{ saved: article.isSaved }"
              @click="store.toggleSave(article.id)"
            >
              <AppIcon
                :name="article.isSaved ? 'bookmark-filled' : 'bookmark'"
                :size="16"
              />
              <span>{{ article.isSaved ? 'Zapisano w czytelni' : 'Zapisz artykuł' }}</span>
            </button>
          </div>

          <section class="reader-comments">
            <h3>Dyskusja naukowa ({{ article.comments.length }})</h3>

            <ul v-if="article.comments.length > 0" class="comments-list">
              <li
                v-for="comment in article.comments"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <strong>{{ comment.author }}</strong>
                  <span>{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p>{{ comment.text }}</p>
              </li>
            </ul>

            <form class="comment-form" @submit.prevent="handleAddComment">
              <input
                v-model="commentInput"
                type="text"
                placeholder="Wpisz komentarz lub pytanie do autora..."
              />
              <button type="submit" :disabled="!commentInput.trim()">
                Dodaj komentarz
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 17, 23, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-sheet {
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.modal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-subtle);
}

.modal-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-badge {
  font-weight: 700;
  font-size: 0.75rem;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.type-badge {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.close-modal-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.close-modal-btn:hover {
  color: var(--text-main);
  background: var(--bg-hover);
}

.modal-scroll {
  padding: 28px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reader-title {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-main);
}

.reader-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--text-muted);
}

.reader-author {
  font-weight: 700;
  color: var(--text-main);
}

.reader-figure {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
}

.reader-figure img {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  display: block;
}

.reader-body {
  font-size: 1.02rem;
  line-height: 1.75;
  color: var(--text-secondary);
  white-space: pre-line;
  max-width: 68ch;
}

.reader-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reader-tag {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.reader-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 14px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.86rem;
}

.action-btn.liked,
.action-btn.saved {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.reader-comments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reader-comments h3 {
  font-size: 0.98rem;
  font-weight: 700;
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
  padding: 10px 14px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.comment-header span {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.comment-item p {
  font-size: 0.88rem;
  color: var(--text-secondary);
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
  color: var(--text-main);
  font-size: 0.88rem;
}

.comment-form button {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
}

[data-theme='dark'] .comment-form button {
  color: #0f1117;
}

.comment-form button:disabled {
  opacity: 0.45;
}

@media (max-width: 640px) {
  .modal-backdrop {
    padding: 10px;
  }
  .modal-scroll {
    padding: 18px;
  }
  .reader-title {
    font-size: 1.35rem;
  }
}
</style>