<template>
  <div class="not-found">
    <div class="error-code">404</div>
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.description') }}</p>
    <router-link to="/" class="home-link">
      {{ t('notFound.goHome') }}
    </router-link>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 24px;
}

.not-found h1 {
  margin: 0 0 16px 0;
  font-size: 28px;
}

.not-found p {
  margin: 0 0 32px 0;
  color: var(--text-secondary);
}

.home-link {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: opacity 0.2s;
}

.home-link:hover {
  opacity: 0.9;
}
</style>
