<template>
  <div class="about-view">
    <div class="about-content">
      <div class="logo-section">
        <img src="/logo-banner.png" alt="ChatALL Logo" class="logo" />
        <h1>ChatALL</h1>
        <p class="tagline">{{ t('about.tagline') }}</p>
      </div>
      
      <div class="info-section">
        <h2>{{ t('about.about') }}</h2>
        <p>{{ t('about.description') }}</p>
      </div>
      
      <div class="features-section">
        <h2>{{ t('about.features') }}</h2>
        <ul class="features-list">
          <li>{{ t('about.feature1') }}</li>
          <li>{{ t('about.feature2') }}</li>
          <li>{{ t('about.feature3') }}</li>
          <li>{{ t('about.feature4') }}</li>
        </ul>
      </div>
      
      <div class="version-section">
        <p>{{ t('about.version') }}: {{ version }}</p>
      </div>
      
      <div class="links-section">
        <a href="https://github.com/qingjian0/ChatALL" target="_blank" class="link">
          <span>GitHub</span>
        </a>
        <a href="https://chatall.io" target="_blank" class="link">
          <span>Website</span>
        </a>
      </div>
      
      <div class="license-section">
        <p>{{ t('about.license') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const version = ref('1.86.8')
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.about-content {
  max-width: 600px;
  text-align: center;
}

.logo-section {
  margin-bottom: 40px;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  margin-bottom: 20px;
}

.logo-section h1 {
  margin: 0 0 8px 0;
  font-size: 36px;
}

.tagline {
  margin: 0;
  color: var(--text-secondary);
}

.info-section,
.features-section,
.version-section,
.links-section,
.license-section {
  margin-bottom: 32px;
}

.info-section h2,
.features-section h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
}

.info-section p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.version-section p {
  margin: 0;
  color: var(--text-secondary);
}

.links-section {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.link {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: opacity 0.2s;
}

.link:hover {
  opacity: 0.9;
}

.license-section p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
