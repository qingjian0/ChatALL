<template>
  <div class="settings-view">
    <aside class="settings-sidebar">
      <nav>
        <router-link to="/settings/bots" class="nav-item" :class="{ active: $route.name === 'SettingsBots' }">
          <span class="icon">🤖</span>
          <span>{{ t('settings.bots') }}</span>
        </router-link>
        <router-link to="/settings/appearance" class="nav-item" :class="{ active: $route.name === 'SettingsAppearance' }">
          <span class="icon">🎨</span>
          <span>{{ t('settings.appearance') }}</span>
        </router-link>
      </nav>
    </aside>
    <main class="settings-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.settings-view {
  display: flex;
  height: 100vh;
}

.settings-sidebar {
  width: 200px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-color);
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item:hover {
  background: var(--hover-bg);
}

.nav-item.active {
  background: var(--active-bg);
  color: var(--primary-color);
}

.icon {
  font-size: 18px;
}

.settings-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
