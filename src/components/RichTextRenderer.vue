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
  | { type: 'math-block'; expr: string }
  | { type: 'quote'; text: string }
  | { type: 'paragraph'; text: string };

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'math'; value: string };

type MathPart =
  | { kind: 'plain'; text: string }
  | { kind: 'sup'; text: string }
  | { kind: 'sub'; text: string };

const SYMBOL_MAP: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\epsilon': 'ε',
  '\\theta': 'θ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\pi': 'π',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\tau': 'τ',
  '\\phi': 'φ',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\sum': '∑',
  '\\int': '∫',
  '\\sqrt': '√',
  '\\approx': '≈',
  '\\neq': '≠',
  '\\le': '≤',
  '\\ge': '≥',
  '\\pm': '±',
  '\\infty': '∞',
  '\\cdot': '·',
  '\\times': '×',
  '\\to': '→',
  '\\in': '∈',
};

// Replace LaTeX symbol commands with clean Unicode glyphs
const normalizeMathSymbols = (raw: string): string => {
  let out = raw;
  for (const [cmd, glyph] of Object.entries(SYMBOL_MAP)) {
    out = out.split(cmd).join(glyph);
  }
  return out;
};

// Parse superscripts (^2, ^{n+1}) and subscripts (_i, _{max}) safely into VNode parts
const parseMathParts = (expr: string): MathPart[] => {
  const normalized = normalizeMathSymbols(expr.trim());
  const parts: MathPart[] = [];
  const scriptRegex = /(\^|_)(?:\{([^}]+)\}|([A-Za-z0-9+-]+))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(normalized)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ kind: 'plain', text: normalized.slice(lastIdx, match.index) });
    }
    const marker = match[1];
    const value = match[2] ?? match[3] ?? '';
    parts.push({
      kind: marker === '^' ? 'sup' : 'sub',
      text: value,
    });
    lastIdx = scriptRegex.lastIndex;
  }

  if (lastIdx < normalized.length) {
    parts.push({ kind: 'plain', text: normalized.slice(lastIdx) });
  }

  return parts;
};

// Parse fenced code blocks (```...```), display math ($$...$$), blockquotes (> ...), and paragraphs
const blocks = computed<BlockSegment[]>(() => {
  const result: BlockSegment[] = [];
  const blockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```|\$\$([\s\S]*?)\$\$/g;
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

  while ((match = blockRegex.exec(props.content)) !== null) {
    if (match.index > lastIndex) {
      pushTextChunk(props.content.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      result.push({
        type: 'code',
        lang: (match[1] || 'code').toLowerCase(),
        code: match[2].replace(/\n$/, ''),
      });
    } else if (match[3] !== undefined) {
      result.push({
        type: 'math-block',
        expr: match[3].trim(),
      });
    }

    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < props.content.length) {
    pushTextChunk(props.content.slice(lastIndex));
  }

  return result;
});

// Split inline `code` and $math$ tokens safely without innerHTML
const parseInline = (text: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  const inlineRegex = /`([^`]+)`|\$([^$\n]+)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: 'code', value: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ type: 'math', value: match[2] });
    }
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

      <!-- Display Equation Block ($$ ... $$) -->
      <div v-else-if="block.type === 'math-block'" class="math-display">
        <span class="math-formula">
          <template v-for="(part, pIdx) in parseMathParts(block.expr)" :key="pIdx">
            <sup v-if="part.kind === 'sup'">{{ part.text }}</sup>
            <sub v-else-if="part.kind === 'sub'">{{ part.text }}</sub>
            <span v-else>{{ part.text }}</span>
          </template>
        </span>
      </div>

      <!-- Scientific Quote / Hypothesis Callout -->
      <blockquote v-else-if="block.type === 'quote'" class="science-quote">
        <template v-for="(tok, tIdx) in parseInline(block.text)" :key="tIdx">
          <code v-if="tok.type === 'code'" class="inline-code">{{ tok.value }}</code>
          <span v-else-if="tok.type === 'math'" class="inline-math">
            <template v-for="(part, pIdx) in parseMathParts(tok.value)" :key="pIdx">
              <sup v-if="part.kind === 'sup'">{{ part.text }}</sup>
              <sub v-else-if="part.kind === 'sub'">{{ part.text }}</sub>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
          <span v-else>{{ tok.value }}</span>
        </template>
      </blockquote>

      <!-- Standard Paragraph with Inline Code & Formulas -->
      <p v-else class="rich-paragraph">
        <template v-for="(tok, tIdx) in parseInline(block.text)" :key="tIdx">
          <code v-if="tok.type === 'code'" class="inline-code">{{ tok.value }}</code>
          <span v-else-if="tok.type === 'math'" class="inline-math">
            <template v-for="(part, pIdx) in parseMathParts(tok.value)" :key="pIdx">
              <sup v-if="part.kind === 'sup'">{{ part.text }}</sup>
              <sub v-else-if="part.kind === 'sub'">{{ part.text }}</sub>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
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

.inline-math {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.04em;
  padding: 0 3px;
  color: var(--text-main);
}

.inline-math sup,
.inline-math sub,
.math-formula sup,
.math-formula sub {
  font-size: 0.72em;
  line-height: 0;
}

.math-display {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  text-align: center;
  overflow-x: auto;
}

.math-formula {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.15rem;
  letter-spacing: 0.02em;
  color: var(--text-main);
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