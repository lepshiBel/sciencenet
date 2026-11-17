<script setup lang="ts">
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();

const handleAction = (toastId: string, callback?: () => void) => {
  if (callback) callback();
  store.dismissToast(toastId);
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="toast-item card"
        >
          <span class="toast-msg">{{ toast.message }}</span>

          <button
            v-if="toast.actionLabel"
            type="button"
            class="toast-action"
            @click="handleAction(toast.id, toast.onAction)"
          >
            {{ toast.actionLabel }}
          </button>

          <button
            type="button"
            class="toast-close"
            aria-label="Zamknij powiadomienie"
            @click="store.dismissToast(toast.id)"
          >
            <AppIcon name="close" :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100vw - 32px);
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-md);
  font-size: 0.85rem;
  color: var(--text-main);
}

.toast-msg {
  font-weight: 500;
}

.toast-action {
  background: var(--primary-soft);
  border: 1px solid var(--primary-border);
  color: var(--primary);
  font-weight: 700;
  font-size: 0.78rem;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  padding: 2px;
}

.toast-close:hover {
  color: var(--text-main);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>