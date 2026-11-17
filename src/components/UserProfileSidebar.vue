<script setup lang="ts">
import { ref, computed } from 'vue';
import { useArticleStore } from '../stores/useArticleStore';
import AppIcon from './AppIcon.vue';

const store = useArticleStore();

const isEditingProfile = ref(false);
const draftName = ref('');
const draftTitle = ref('');
const draftInstitution = ref('');
const draftBio = ref('');
const draftAvatar = ref('');

const startEdit = () => {
  draftName.value = store.currentUser.name;
  draftTitle.value = store.currentUser.title;
  draftInstitution.value = store.currentUser.institution;
  draftBio.value = store.currentUser.bio;
  draftAvatar.value = store.currentUser.avatarUrl;
  isEditingProfile.value = true;
};

const saveProfile = () => {
  if (!draftName.value.trim()) return;
  store.updateProfile({
    name: draftName.value.trim(),
    title: draftTitle.value.trim(),
    institution: draftInstitution.value.trim(),
    bio: draftBio.value.trim(),
    avatarUrl: draftAvatar.value.trim() || store.currentUser.avatarUrl,
  });
  isEditingProfile.value = false;
};

const totalLikes = computed(() =>
  store.articles.reduce((sum, article) => sum + article.likes, 0)
);

const myArticlesCount = computed(() =>
  store.articles.filter(
    (a) =>
      a.isOwn ||
      a.author.trim().toLowerCase() === store.currentUser.name.trim().toLowerCase()
  ).length
);
</script>

<template>
  <aside class="card profile-card">
    <div class="cover-banner">
      <button
        type="button"
        class="edit-profile-btn"
        :title="isEditingProfile ? 'Zamknij edycję' : 'Edytuj profil badacza'"
        @click="isEditingProfile ? (isEditingProfile = false) : startEdit()"
      >
        <AppIcon :name="isEditingProfile ? 'close' : 'edit'" :size="14" />
      </button>
    </div>

    <div v-if="!isEditingProfile" class="profile-body">
      <img
        :src="store.currentUser.avatarUrl"
        :alt="store.currentUser.name"
        class="avatar"
      />

      <h2 class="user-name">{{ store.currentUser.name }}</h2>
      <p class="user-title">{{ store.currentUser.title }}</p>
      <p class="user-institution">
        <AppIcon name="building" :size="13" />
        <span>{{ store.currentUser.institution }}</span>
      </p>

      <p class="user-bio">{{ store.currentUser.bio }}</p>

      <div class="stats-grid">
        <button
          type="button"
          class="stat-item clickable"
          :class="{ active: store.onlyMine }"
          title="Filtruj moje publikacje"
          @click="store.onlyMine = !store.onlyMine"
        >
          <span class="stat-value">{{ myArticlesCount }}</span>
          <span class="stat-label">Moje</span>
        </button>
        <div class="stat-item">
          <span class="stat-value">{{ totalLikes }}</span>
          <span class="stat-label">Polubienia</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.savedArticles.length }}</span>
          <span class="stat-label">Zapisane</span>
        </div>
      </div>
    </div>

    <form v-else class="profile-edit-form" @submit.prevent="saveProfile">
      <h3 class="edit-heading">Edycja profilu</h3>

      <label>
        <span>Imię i nazwisko</span>
        <input v-model="draftName" type="text" required />
      </label>

      <label>
        <span>Specjalizacja / Stopień</span>
        <input v-model="draftTitle" type="text" />
      </label>

      <label>
        <span>Uczelnia / Instytut</span>
        <input v-model="draftInstitution" type="text" />
      </label>

      <label>
        <span>URL zdjęcia profilowego</span>
        <input v-model="draftAvatar" type="url" />
      </label>

      <label>
        <span>Nota biograficzna</span>
        <textarea v-model="draftBio" rows="3"></textarea>
      </label>

      <div class="edit-actions">
        <button type="button" class="btn-cancel" @click="isEditingProfile = false">
          Anuluj
        </button>
        <button type="submit" class="btn-save">Zapisz</button>
      </div>
    </form>
  </aside>
</template>

<style scoped>
.profile-card {
  overflow: hidden;
  position: sticky;
  top: 74px;
}

.cover-banner {
  height: 64px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  position: relative;
}

.edit-profile-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(15, 23, 42, 0.55);
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.edit-profile-btn:hover {
  background: rgba(15, 23, 42, 0.85);
}

.profile-body {
  padding: 0 18px 20px;
  text-align: center;
}

.avatar {
  position: relative;
  z-index: 2;
  display: block;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--bg-card);
  margin: -36px auto 0;
  background: var(--bg-subtle);
}

.user-name {
  margin-top: 10px;
  font-size: 1.06rem;
  font-weight: 700;
  color: var(--text-main);
}

.user-title {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--primary);
  margin-top: 2px;
}

.user-institution {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 6px;
}

.user-bio {
  font-size: 0.83rem;
  color: var(--text-muted);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  text-align: left;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
}

.stat-item.clickable:hover {
  background: var(--bg-hover);
}

.stat-item.clickable.active {
  background: var(--primary-soft);
  border-color: var(--primary-border);
}

.stat-value {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.96rem;
  color: var(--text-main);
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* Edit Profile Form */
.profile-edit-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.profile-edit-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.profile-edit-form input,
.profile-edit-form textarea {
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-main);
  font-size: 0.84rem;
}

.profile-edit-form input:focus,
.profile-edit-form textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn-cancel,
.btn-save {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
}

.btn-cancel {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.btn-save {
  background: var(--primary);
  border: none;
  color: #ffffff;
}

[data-theme='dark'] .btn-save {
  color: #0f1117;
}
</style>