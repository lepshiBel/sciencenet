<script setup lang="ts">
import { computed, ref } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';

const props = defineProps<{
  content: string;
}>();

const store = useArticleStore();
const copiedIndex = ref<number | null>(null);

type BlockSegment =
  | { type: 'code'; code: string; lang: string }
  | { type: 'quote'; text: string }
  | { type: 'paragraph'; text: string };

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string };

// Parse fenced code blocks (```...```), blockquotes (> ...), and regular paragraphs
const blocks = computed<BlockSegment[]>(() => {
  const result: BlockSegment[] = [];
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushTextChunk = (chunk: string) => {
    const paragraphs = chunk.split(/\n{2,}/);
    for (const rawPara of paragraphs) {
      const trimmed = rawPara.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n');
      if (lines.every((line) => line.trim().startsWith('>'))) {
        const quoteBody = lines
          .map((line) => line.replace(/^\s*>\s?/, ''))
          .join('\n')
          .trim();
        result.push({ type: 'quote', text: quoteBody });
      } else {
        result.push({ type: 'paragraph', text: trimmed });
      }
    }
  };

  while ((match = fenceRegex.exec(props.content)) !== null) {
    if (match.index > lastIndex) {
      pushTextChunk(props.content.slice(lastIndex, match.index));
    }
    result.push({
      type: 'code',
      lang: (match[1] || 'code').toLowerCase(),
      code: match[2].replace(/\n$/, ''),
    });
    lastIndex = fenceRegex.lastIndex;
  }

  if (lastIndex < props.content.length) {
    pushTextChunk(props.content.slice(lastIndex));
  }

  return result;
});

// Split inline `code` / formula tokens safely without innerHTML
const parseInline = (text: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  const inlineRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    tokens.push({ type: 'code', value: match[1] });
    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
};

const copyCodeBlock = async (code: string, idx: number) => {
  try {
    await navigator.clipboard.writeText(code);
    copiedIndex.value = idx;
    store.notify('Skopiowano fragment kodu / wzoru', { duration: 2000 });
    setTimeout(() => {
      if (copiedIndex.value === idx) copiedIndex.value = null;
    }, 2000);
  } catch {
    store.notify('Nie udało się skopiować bloku');
  }
};
</script>

<template>
  <div class="rich-content">
    <template v-for="(block, idx) in blocks" :key="idx">
      <!-- Fenced Code / Algorithm Block -->
      <div v-if="block.type === 'code'" class="code-block">
        <div class="code-header">
          <span class="code-lang">{{ block.lang }}</span>
          <button
            type="button"
            class="copy-code-btn"
            @click.stop="copyCodeBlock(block.code, idx)"
          >
            <AppIcon :name="copiedIndex === idx ? 'check' : 'copy'" :size="12" />
            <span>{{ copiedIndex === idx ? 'Skopiowano' : 'Kopiuj' }}</span>
          </button>
        </div>
        <pre><code>{{ block.code }}</code></pre>
      </div>

      <!-- Scientific Quote / Hypothesis Callout -->
      <blockquote v-else-if="block.type === 'quote'" class="science-quote">
        <template v-for="(tok, tIdx) in parseInline(block.text)" :key="tIdx">
          <code v-if="tok.type === 'code'" class="inline-code">{{ tok.value }}</code>
          <span v-else>{{ tok.value }}</span>
        </template>
      </blockquote>

      <!-- Standard Paragraph with Inline Code/Formulas -->
      <p v-else class="rich-paragraph">
        <template v-for="(tok, tIdx) in parseInline(block.text)" :key="tIdx">
          <code v-if="tok.type === 'code'" class="inline-code">{{ tok.value }}</code>
          <span v-else>{{ tok.value }}</span>
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>
.rich-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rich-paragraph {
  white-space: pre-line;
  margin: 0;
}

.inline-code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--primary);
}

.science-quote {
  margin: 0;
  padding: 10px 14px;
  border-left: 3px solid var(--primary);
  background: var(--primary-soft);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  color: var(--text-main);
  font-style: italic;
  white-space: pre-line;
}

.code-block {
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
}

.code-lang {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
}

.copy-code-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 4px;
}

.copy-code-btn:hover {
  color: var(--primary);
}

.code-block pre {
  margin: 0;
  padding: 12px 14px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--text-main);
}
</style>