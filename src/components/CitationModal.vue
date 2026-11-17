<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();
const activeFormat = ref<'APA' | 'BIBTEX'>('APA');
const copied = ref(false);

const article = computed(() => store.citingArticle);

watch(article, (val) => {
  copied.value = false;
  if (val) {
    activeFormat.value = 'APA';
  }
});

// Strip academic titles to extract clean author name & surname
const parsedAuthor = computed(() => {
  if (!article.value) return { fullName: '', lastName: 'Author', initials: '' };

  const cleaned = article.value.author
    .replace(/\b(prof\.|dr|hab\.|inż\.|mgr|lic\.|phd|md)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length === 0) {
    return { fullName: article.value.author, lastName: 'Author', initials: '' };
  }
  if (parts.length === 1) {
    return { fullName: parts[0], lastName: parts[0], initials: '' };
  }

  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((p) => `${p[0].toUpperCase()}.`)
    .join(' ');

  return {
    fullName: parts.join(' '),
    lastName,
    initials,
  };
});

const pubYear = computed(() => {
  if (!article.value) return new Date().getFullYear();
  return new Date(article.value.createdAt).getFullYear();
});

const pubDateFormatted = computed(() => {
  if (!article.value) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.value.createdAt));
});

const apaCitation = computed(() => {
  if (!article.value) return '';
  const { lastName, initials } = parsedAuthor.value;
  const authorBlock = initials ? `${lastName}, ${initials}` : lastName;

  return `${authorBlock} (${pubDateFormatted.value}). ${article.value.title} [${article.value.publicationType}]. ScienceNet Research Repository (${article.value.field}).`;
});

const normalizeAscii = (text: string): string => {
  const map: Record<string, string> = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .replace(/[^a-z0-9]/g, '');
};

const bibtexCitation = computed(() => {
  if (!article.value) return '';
  const surnameSlug = normalizeAscii(parsedAuthor.value.lastName) || 'researcher';
  const firstWord =
    normalizeAscii(article.value.title.split(/\s+/)[0] || 'paper') || 'paper';
  const citeKey = `${surnameSlug}${pubYear.value}${firstWord}`;

  return `@article{${citeKey},
  author  = {${parsedAuthor.value.fullName}},
  title   = {${article.value.title}},
  journal = {ScienceNet Academic Network},
  year    = {${pubYear.value}},
  note    = {${article.value.publicationType} -- ${article.value.field}}
}`;
});

const displayedText = computed(() =>
  activeFormat.value === 'APA' ? apaCitation.value : bibtexCitation.value
);

const copyCitation = async () => {
  try {
    await navigator.clipboard.writeText(displayedText.value);
    copied.value = true;
    store.notify(`Skopiowano cytowanie (${activeFormat.value}) do schowka`, {
      duration: 2400,
    });
    setTimeout(() => {
      copied.value = false;
    }, 2200);
  } catch {
    store.notify('Nie udało się skopiować automatycznie — zaznacz tekst ręcznie');
  }
};

const closeModal = () => {
  store.citingArticle = null;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && store.citingArticle) {
    closeModal();
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="article"
      class="cite-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Generator cytowań"
      @click.self="closeModal"
    >
      <div class="cite-dialog card">
        <div class="cite-header">
          <div class="cite-title">
            <AppIcon name="quote" :size="16" />
            <h3>Cytuj publikację</h3>
          </div>

          <button
            type="button"
            class="close-btn"
            aria-label="Zamknij"
            @click="closeModal"
          >
            <AppIcon name="close" :size="16" />
          </button>
        </div>

        <div class="cite-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeFormat === 'APA' }"
            @click="activeFormat = 'APA'; copied = false"
          >
            APA 7th Edition
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeFormat === 'BIBTEX' }"
            @click="activeFormat = 'BIBTEX'; copied = false"
          >
            BibTeX
          </button>
        </div>

        <pre
          class="citation-box"
          :class="{ mono: activeFormat === 'BIBTEX' }"
        >{{ displayedText }}</pre>

        <div class="cite-footer">
          <button type="button" class="btn-secondary" @click="closeModal">
            Zamknij
          </button>
          <button type="button" class="btn-primary" @click="copyCitation">
            <AppIcon :name="copied ? 'check' : 'copy'" :size="15" />
            <span>{{ copied ? 'Skopiowano' : 'Kopiuj do schowka' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cite-backdrop {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: rgba(15, 17, 23, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.cite-dialog {
  width: 100%;
  max-width: 560px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-md);
}

.cite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cite-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
}

.cite-title h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
}

.close-btn {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cite-tabs {
  display: flex;
  gap: 6px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.tab-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
}

.tab-btn.active {
  background: var(--primary-soft);
  border-color: var(--primary-border);
  color: var(--primary);
}

.citation-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--text-main);
  white-space: pre-wrap;
  word-break: break-word;
  user-select: all;
}

.citation-box.mono {
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.cite-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 0.84rem;
  font-weight: 600;
}

.btn-secondary {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-primary {
  background: var(--primary);
  border: none;
  color: #ffffff;
}

[data-theme='dark'] .btn-primary {
  color: #0f1117;
}
</style>