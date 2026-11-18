<script setup lang="ts">
import { useArticleStore } from '../stores/useArticleStore';
import { FIELD_STYLES } from '../data/mockArticles';
import AppIcon from '../components/AppIcon.vue';

const store = useArticleStore();

const formatDate = (isoString: string): string => {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString));
};
</script>

<template>
  <section class="saved-view">
    <div class="card saved-header">
      <div>
        <h1>Czytelnia badacza</h1>
        <p>Zapisane publikacje oraz Twoje prywatne notatki do późniejszej analizy.</p>
      </div>

      <div class="header-right">
        <button
          v-if="store.savedArticles.length > 0"
          type="button"
          class="bib-export-btn"
          title="Pobierz wszystkie zapisane pozycje w formacie BibTeX"
          @click="store.exportSavedBibtex()"
        >
          <AppIcon name="quote" :size="14" />
          <span>Eksportuj .bib</span>
        </button>

        <span class="saved-badge">
          {{ store.savedArticles.length }} zapisanych
        </span>
      </div>
    </div>

    <div v-if="store.savedArticles.length === 0" class="card empty-saved">
      <div class="empty-icon">
        <AppIcon name="bookmark" :size="26" />
      </div>
      <h2>Twoja czytelnia jest pusta</h2>
      <p>
        Kliknij przycisk <strong>„Zapisz”</strong> przy dowolnym artykule na tablicy głównej
        lub dodaj własną notatkę w trybie czytania.
      </p>
      <RouterLink to="/" class="back-btn">
        <span>←</span>
        <span>Wróć do tablicy głównej</span>
      </RouterLink>
    </div>

    <div v-else class="saved-grid">
      <article
        v-for="article in store.savedArticles"
        :key="article.id"
        class="card saved-item"
      >
        <div class="saved-item-top">
          <div class="badges-group">
            <span
              class="field-badge"
              :style="{
                backgroundColor: FIELD_STYLES[article.field].bg,
                color: FIELD_STYLES[article.field].text,
                borderColor: FIELD_STYLES[article.field].border,
              }"
            >
              {{ article.field }}
            </span>
            <span class="type-pill">{{ article.publicationType }}</span>
          </div>

          <button
            type="button"
            class="remove-btn"
            @click="store.toggleSave(article.id)"
          >
            <AppIcon name="close" :size="13" />
            <span>Usuń z czytelni</span>
          </button>
        </div>

        <h2 class="saved-title" @click="store.activeArticle = article">
          {{ article.title }}
        </h2>

        <p class="saved-meta">
          {{ article.author }} • {{ formatDate(article.createdAt) }}
        </p>

        <p class="saved-excerpt">
          {{ article.content }}
        </p>

        <div
          v-if="article.personalNote"
          class="saved-note-preview"
          @click="store.activeArticle = article"
        >
          <span class="note-label">Twoja notatka:</span>
          <span>{{ article.personalNote }}</span>
        </div>

        <div class="saved-footer">
          <div class="footer-actions">
            <button
              type="button"
              class="open-btn"
              @click="store.activeArticle = article"
            >
              <AppIcon name="book-open" :size="14" />
              <span>{{ article.personalNote ? 'Otwórz i edytuj notatkę' : 'Otwórz i dodaj notatkę' }}</span>
            </button>

            <button
              type="button"
              class="cite-btn"
              @click="store.citingArticle = article"
            >
              <AppIcon name="quote" :size="14" />
              <span>Cytuj</span>
            </button>
          </div>

          <span class="stats-inline">
            {{ article.likes }} polubień • {{ article.comments.length }} komentarzy
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.saved-view {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.saved-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.saved-header p {
  font-size: 0.86rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bib-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  transition: background-color 0.15s, color 0.15s;
}

.bib-export-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  border-color: var(--border-strong);
}

.saved-badge {
  font-family: var(--font-mono);
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid var(--primary-border);
  font-weight: 600;
  font-size: 0.78rem;
  padding: 5px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

.empty-saved {
  padding: 46px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-saved h2 {
  font-size: 1.08rem;
  color: var(--text-main);
}

.empty-saved p {
  font-size: 0.88rem;
  color: var(--text-muted);
  max-width: 440px;
}

.back-btn {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: var(--primary);
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: var(--radius-md);
}

[data-theme='dark'] .back-btn {
  color: #0f1117;
}

.saved-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saved-item {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.saved-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.badges-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
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

.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
}

.remove-btn:hover {
  color: var(--danger);
}

.saved-title {
  font-family: var(--font-serif);
  font-size: 1.24rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
}

.saved-title:hover {
  color: var(--primary);
}

.saved-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.saved-excerpt {
  font-size: 0.88rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.saved-note-preview {
  padding: 8px 12px;
  border-left: 3px solid var(--primary);
  background: var(--primary-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 0.83rem;
  color: var(--text-main);
  cursor: pointer;
}

.note-label {
  font-weight: 700;
  color: var(--primary);
  margin-right: 6px;
}

.saved-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.open-btn,
.cite-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
}

.open-btn {
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid var(--primary-border);
}

.cite-btn {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.stats-inline {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--text-muted);
}
</style>