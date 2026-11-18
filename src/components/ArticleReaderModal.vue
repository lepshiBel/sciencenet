<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import { FIELD_STYLES } from '../data/mockArticles';
import type { Article } from '../types/article';
import AppIcon from './AppIcon.vue';
import RichTextRenderer from './RichTextRenderer.vue';

const store = useArticleStore();
const commentInput = ref('');
const modalScrollRef = ref<HTMLElement | null>(null);

// Inline comment editing state
const editingCommentId = ref<string | null>(null);
const editingCommentText = ref('');

// Private researcher margin note draft
const noteDraft = ref('');

const article = computed(() => store.activeArticle);

// Lock background page scroll while the reader modal is open
watch(
  article,
  (current) => {
    const overflowValue = current ? 'hidden' : '';
    document.body.style.overflow = overflowValue;
    document.documentElement.style.overflow = overflowValue;
    editingCommentId.value = null;
    editingCommentText.value = '';
    noteDraft.value = current?.personalNote || '';
    if (current && modalScrollRef.value) {
      modalScrollRef.value.scrollTop = 0;
    }
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

// Keep the last word of the author's name bound to the verification badge
const splitAuthorName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { prefix: '', lastWord: fullName.trim() };
  }
  const lastWord = parts.pop() || '';
  return { prefix: parts.join(' ') + ' ', lastWord };
};

// Find up to 3 related articles scored by shared tags and matching science field
const relatedArticles = computed<Article[]>(() => {
  const current = article.value;
  if (!current) return [];

  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));

  return store.articles
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.field === current.field) score += 2;
      for (const tag of candidate.tags) {
        if (currentTags.has(tag.toLowerCase())) score += 3;
      }
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.likes - a.candidate.likes)
    .slice(0, 3)
    .map((item) => item.candidate);
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

const switchArticle = (target: Article) => {
  store.activeArticle = target;
};

const printArticle = () => {
  window.print();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.activeArticle && !store.citingArticle) {
    if (editingCommentId.value) {
      editingCommentId.value = null;
    } else {
      closeModal();
    }
  }
};

const handleSaveNote = () => {
  if (!article.value) return;
  store.updatePersonalNote(article.value.id, noteDraft.value);
};

const handleAddComment = () => {
  if (!article.value || !commentInput.value.trim()) return;
  store.addComment(article.value.id, commentInput.value);
  commentInput.value = '';
};

const startEditComment = (commentId: string, currentText: string) => {
  editingCommentId.value = commentId;
  editingCommentText.value = currentText;
};

const saveEditComment = (commentId: string) => {
  if (!article.value || !editingCommentText.value.trim()) return;
  store.updateComment(article.value.id, commentId, editingCommentText.value);
  editingCommentId.value = null;
  editingCommentText.value = '';
};

const removeComment = (commentId: string) => {
  if (!article.value) return;
  store.deleteComment(article.value.id, commentId);
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
      class="modal-backdrop print-reader-root"
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

          <div class="topbar-controls no-print">
            <button
              type="button"
              class="print-btn"
              title="Drukuj publikację lub zapisz jako PDF"
              @click="printArticle"
            >
              <AppIcon name="download" :size="14" />
              <span>Drukuj / PDF</span>
            </button>

            <button
              type="button"
              class="close-modal-btn"
              aria-label="Zamknij tryb czytania"
              @click="closeModal"
            >
              <AppIcon name="close" :size="18" />
            </button>
          </div>
        </div>

        <div ref="modalScrollRef" class="modal-scroll">
          <h1 class="reader-title">{{ article.title }}</h1>

          <div class="reader-meta">
            <span class="reader-author">
              <span>{{ splitAuthorName(article.author).prefix }}</span>
              <span class="author-tail">
                {{ splitAuthorName(article.author).lastWord }}
                <span
                  v-if="article.isVerifiedAuthor"
                  class="verified-dot"
                  title="Zweryfikowany autor"
                >
                  <AppIcon name="check" :size="10" />
                </span>
              </span>
            </span>
            <span>•</span>
            <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
          </div>

          <div v-if="article.imageUrl" class="reader-figure">
            <img :src="article.imageUrl" :alt="article.title" />
          </div>

          <div class="reader-body">
            <RichTextRenderer :content="article.content" />
          </div>

          <div v-if="article.tags.length > 0" class="reader-tags">
            <span v-for="tag in article.tags" :key="tag" class="reader-tag">
              #{{ tag }}
            </span>
          </div>

          <div class="reader-actions no-print">
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

            <button
              type="button"
              class="action-btn"
              @click="store.citingArticle = article"
            >
              <AppIcon name="quote" :size="15" />
              <span>Cytuj</span>
            </button>
          </div>

          <!-- Private Researcher Margin Note -->
          <section
            class="margin-note-box"
            :class="{ 'no-print': !article.personalNote }"
          >
            <div class="margin-note-header">
              <div class="margin-note-title">
                <AppIcon name="edit" :size="14" />
                <span>Prywatna notatka badawcza</span>
              </div>
              <span v-if="article.personalNote" class="note-saved-badge no-print">
                Zapisano
              </span>
            </div>

            <textarea
              v-model="noteDraft"
              class="no-print"
              rows="2"
              placeholder="Zapisz własne wnioski, cytat do pracy dyplomowej lub uwagi metodologiczne..."
            ></textarea>

            <p v-if="article.personalNote" class="print-only-note">
              {{ article.personalNote }}
            </p>

            <div class="margin-note-actions no-print">
              <button
                v-if="article.personalNote"
                type="button"
                class="btn-xs-secondary"
                @click="noteDraft = ''; handleSaveNote()"
              >
                Wyczyść
              </button>
              <button
                type="button"
                class="btn-xs-primary"
                :disabled="noteDraft.trim() === (article.personalNote || '')"
                @click="handleSaveNote"
              >
                Zapisz notatkę
              </button>
            </div>
          </section>

          <!-- Scientific Discussion -->
          <section class="reader-comments no-print">
            <h3>Dyskusja naukowa ({{ article.comments.length }})</h3>

            <ul v-if="article.comments.length > 0" class="comments-list">
              <li
                v-for="comment in article.comments"
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <strong>{{ comment.author }}</strong>
                  <div class="comment-right-meta">
                    <span>{{ formatDate(comment.createdAt) }}</span>
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

                <div v-if="editingCommentId === comment.id" class="comment-edit-box">
                  <input
                    v-model="editingCommentText"
                    type="text"
                    @keyup.enter="saveEditComment(comment.id)"
                  />
                  <button
                    type="button"
                    class="btn-xs-primary"
                    @click="saveEditComment(comment.id)"
                  >
                    Zapisz
                  </button>
                  <button
                    type="button"
                    class="btn-xs-secondary"
                    @click="editingCommentId = null"
                  >
                    Anuluj
                  </button>
                </div>

                <p v-else>{{ comment.text }}</p>
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

          <!-- Related Publications -->
          <section v-if="relatedArticles.length > 0" class="related-section no-print">
            <h3>Powiązane publikacje</h3>
            <div class="related-grid">
              <button
                v-for="rel in relatedArticles"
                :key="rel.id"
                type="button"
                class="related-card"
                @click="switchArticle(rel)"
              >
                <span
                  class="rel-field"
                  :style="{
                    backgroundColor: FIELD_STYLES[rel.field].bg,
                    color: FIELD_STYLES[rel.field].text,
                    borderColor: FIELD_STYLES[rel.field].border,
                  }"
                >
                  {{ rel.field }}
                </span>
                <p class="rel-title">{{ rel.title }}</p>
                <span class="rel-meta">{{ rel.author }} • {{ rel.likes }} polubień</span>
              </button>
            </div>
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
  flex-shrink: 0;
}

.modal-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
}

.print-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
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
  display: inline;
  font-weight: 700;
  color: var(--text-main);
}

.author-tail {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.verified-dot {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

[data-theme='dark'] .verified-dot {
  color: #0f1117;
}

.reader-figure {
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
}

.reader-figure img {
  width: 100%;
  height: auto;
  max-height: 440px;
  object-fit: cover;
  display: block;
}

.reader-body {
  font-size: 1.02rem;
  line-height: 1.75;
  color: var(--text-secondary);
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

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.action-btn.liked,
.action-btn.saved {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

/* Private Researcher Margin Note */
.margin-note-box {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--primary-border);
  background: var(--primary-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.margin-note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.margin-note-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
}

.note-saved-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.margin-note-box textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 0.85rem;
  resize: vertical;
}

.margin-note-box textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.print-only-note {
  display: none;
}

.margin-note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.margin-note-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reader-comments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reader-comments h3,
.related-section h3 {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-main);
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
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.comment-right-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.comment-right-meta span {
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

.comment-edit-box {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.comment-edit-box input {
  flex: 1;
  padding: 5px 9px;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 0.85rem;
}

.btn-xs-primary,
.btn-xs-secondary {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
}

.btn-xs-primary {
  background: var(--primary);
  border: none;
  color: #ffffff;
}

[data-theme='dark'] .btn-xs-primary {
  color: #0f1117;
}

.btn-xs-secondary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
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

/* Related Articles */
.related-section {
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
}

.related-card {
  text-align: left;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  transition: border-color 0.15s, background-color 0.15s;
}

.related-card:hover {
  border-color: var(--primary-border);
  background: var(--bg-hover);
}

.rel-field {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.rel-title {
  font-family: var(--font-serif);
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rel-meta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
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

<style>
/* Clean Academic Print / PDF Layout */
@media print {
  body * {
    visibility: hidden !important;
  }

  .print-reader-root,
  .print-reader-root * {
    visibility: visible !important;
  }

  .print-reader-root {
    position: static !important;
    background: #ffffff !important;
    backdrop-filter: none !important;
    padding: 0 !important;
    display: block !important;
  }

  .print-reader-root .modal-sheet {
    max-width: 100% !important;
    max-height: none !important;
    border: none !important;
    box-shadow: none !important;
    background: #ffffff !important;
    color: #111827 !important;
  }

  .print-reader-root .modal-topbar {
    background: #ffffff !important;
    border-bottom: 1px solid #d1d5db !important;
    padding: 0 0 10px 0 !important;
  }

  .print-reader-root .modal-scroll {
    overflow: visible !important;
    padding: 16px 0 0 0 !important;
  }

  .print-reader-root .reader-title,
  .print-reader-root .reader-author,
  .print-reader-root .reader-body,
  .print-reader-root .math-formula,
  .print-reader-root .inline-math {
    color: #111827 !important;
  }

  .print-reader-root .no-print {
    display: none !important;
  }

  .print-reader-root .print-only-note {
    display: block !important;
    font-size: 0.9rem;
    color: #1f2937 !important;
    white-space: pre-line;
  }
}
</style>