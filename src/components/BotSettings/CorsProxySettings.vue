<template>

  <div class="cors-proxy-settings">
     <!-- 代理状态概览 --> <v-card class="mb-4"
      > <v-card-title class="text-h5 font-weight-bold"
        > {{ $t("proxy.proxyStatus") }} </v-card-title
      > <v-card-text
        > <v-row
          > <v-col cols="12" sm="6" md="4"
            > <v-chip :color="isProxyEnabled ? 'success' : 'error'" size="small"
              > {{
                isProxyEnabled ? $t("proxy.enabled") : $t("proxy.disabled")
              }} </v-chip
            > </v-col
          > <v-col cols="12" sm="6" md="4"
            > <span class="text-body-1">{{ $t("proxy.activeProxy") }}:</span>
            <span class="text-body-1 font-medium ml-2"
              > {{ activeProxyName || $t("proxy.none") }} </span
            > </v-col
          > <v-col cols="12" sm="6" md="4"
            > <span class="text-body-1">{{ $t("proxy.customProxies") }}:</span>
            <span class="text-body-1 font-medium ml-2">{{
              customProxies.length
            }}</span
            > </v-col
          > </v-row
        > </v-card-text
      > </v-card
    > <!-- 全局代理开关 --> <v-card class="mb-4"
      > <v-card-title>{{ $t("proxy.globalSettings") }}</v-card-title
      > <v-card-text
        > <v-list
          > <v-list-item
            > <v-list-item-title>{{
              $t("proxy.enableCorsProxy")
            }}</v-list-item-title
            > <v-switch
              v-model="isProxyEnabled"
              color="primary"
              @change="toggleProxy"
            ></v-switch
            > </v-list-item
          > <v-list-item
            > <v-list-item-title>{{
              $t("proxy.autoFallback")
            }}</v-list-item-title
            > <v-switch
              v-model="autoFallbackEnabled"
              color="primary"
              @change="saveAutoFallback"
            ></v-switch
            > </v-list-item
          > </v-list
        > </v-card-text
      > </v-card
    > <!-- 自定义代理列表 --> <v-card class="mb-4"
      > <v-card-title
        > {{ $t("proxy.customProxies") }} <v-btn
          class="ml-auto"
          icon="mdi-plus"
          color="primary"
          @click="showAddProxyDialog = true"
        ></v-btn
        > </v-card-title
      > <v-card-text
        > <v-list v-if="customProxies.length > 0"
          > <v-list-item
            v-for="proxy in customProxies"
            :key="proxy.name"
            class="align-start"
            > <v-list-item-avatar
              > <v-icon :color="getProxyStatusColor(proxy)"
                > {{
                  proxy.name === activeProxyName
                    ? "mdi-check-circle"
                    : "mdi-circle"
                }} </v-icon
              > </v-list-item-avatar
            > <v-list-item-content
              > <v-list-item-title class="font-medium">{{
                proxy.name
              }}</v-list-item-title
              > <v-list-item-subtitle class="text-grey">{{
                proxy.url
              }}</v-list-item-subtitle
              > <v-row class="mt-2"
                > <v-chip size="small" :color="getProxyHealthColor(proxy)"
                  > {{ getProxyHealthStatus(proxy) }} </v-chip
                > <v-chip size="small" class="ml-2" color="info"
                  > {{ $t("proxy.successRate") }}: {{ getSuccessRate(proxy) }}%
                  </v-chip
                > </v-row
              > </v-list-item-content
            > <v-list-item-action
              > <v-btn
                icon="mdi-check"
                :disabled="proxy.name === activeProxyName"
                @click="setActiveProxy(proxy.name)"
              ></v-btn
              > <v-btn icon="mdi-refresh" @click="testProxy(proxy)"></v-btn>
              <v-btn
                icon="mdi-delete"
                color="error"
                @click="deleteProxy(proxy.name)"
              ></v-btn
              > </v-list-item-action
            > </v-list-item
          > </v-list
        > <v-empty-state
          v-else
          :icon="'mdi-proxy'"
          :title="$t('proxy.noProxies')"
          > <template #actions
            > <v-btn color="primary" @click="showAddProxyDialog = true"
              > {{ $t("proxy.addProxy") }} </v-btn
            > </template
          > </v-empty-state
        > </v-card-text
      > </v-card
    > <!-- 备用代理列表 --> <v-card class="mb-4"
      > <v-card-title>{{ $t("proxy.fallbackProxies") }}</v-card-title
      > <v-card-text
        > <v-list
          > <v-list-item v-for="proxyName in fallbackProxies" :key="proxyName"
            > <v-list-item-title>{{ proxyName }}</v-list-item-title
            > <v-btn
              icon="mdi-x"
              color="error"
              size="small"
              @click="removeFallback(proxyName)"
            ></v-btn
            > </v-list-item
          > </v-list
        > <v-btn
          v-if="availableFallbackProxies.length > 0"
          class="mt-4"
          color="primary"
          @click="showFallbackSelector = true"
          > {{ $t("proxy.addFallback") }} </v-btn
        >
        <p v-else class="text-body-2 text-grey mt-4">
           {{ $t("proxy.noAvailableFallback") }}
        </p>
         </v-card-text
      > </v-card
    > <!-- 代理统计 --> <v-card
      > <v-card-title>{{ $t("proxy.proxyStats") }}</v-card-title
      > <v-card-text
        > <v-row
          > <v-col cols="12" sm="6" md="3"
            > <v-card class="text-center"
              > <v-card-text class="text-4xl font-bold text-primary"
                > {{ stats.totalRequests }} </v-card-text
              > <v-card-text class="text-body-2 text-grey">{{
                $t("proxy.totalRequests")
              }}</v-card-text
              > </v-card
            > </v-col
          > <v-col cols="12" sm="6" md="3"
            > <v-card class="text-center"
              > <v-card-text class="text-4xl font-bold text-success"
                > {{ stats.requestsLastHour }} </v-card-text
              > <v-card-text class="text-body-2 text-grey">{{
                $t("proxy.requestsLastHour")
              }}</v-card-text
              > </v-card
            > </v-col
          > <v-col cols="12" sm="6" md="3"
            > <v-card class="text-center"
              > <v-card-text class="text-4xl font-bold text-warning"
                > {{ stats.rateLimitedRequests }} </v-card-text
              > <v-card-text class="text-body-2 text-grey">{{
                $t("proxy.rateLimited")
              }}</v-card-text
              > </v-card
            > </v-col
          > <v-col cols="12" sm="6" md="3"
            > <v-card class="text-center"
              > <v-card-text class="text-4xl font-bold text-error"
                > {{ stats.errorRequests }} </v-card-text
              > <v-card-text class="text-body-2 text-grey">{{
                $t("proxy.errors")
              }}</v-card-text
              > </v-card
            > </v-col
          > </v-row
        > </v-card-text
      > </v-card
    > <!-- 添加代理对话框 --> <v-dialog
      v-model="showAddProxyDialog"
      max-width="500px"
      > <v-card
        > <v-card-title>{{ $t("proxy.addProxy") }}</v-card-title
        > <v-card-text
          > <v-form v-model="addProxyForm.valid"
            > <v-text-field
              v-model="newProxy.name"
              :label="$t('proxy.proxyName')"
              required
              :error-messages="$t('proxy.nameRequired')"
            ></v-text-field
            > <v-text-field
              v-model="newProxy.url"
              :label="$t('proxy.proxyUrl')"
              required
              :error-messages="$t('proxy.urlRequired')"
            ></v-text-field
            > <v-text-field
              v-model.number="newProxy.timeout"
              :label="$t('proxy.timeout')(ms)"
              type="number"
              :min="1000"
              :max="60000"
              :default="30000"
            ></v-text-field
            > <v-switch
              v-model="newProxy.isFallback"
              :label="$t('proxy.addAsFallback')"
            ></v-switch
            > </v-form
          > </v-card-text
        > <v-card-actions
          > <v-btn @click="showAddProxyDialog = false">{{
            $t("common.cancel")
          }}</v-btn
          > <v-btn
            color="primary"
            @click="addProxy"
            :disabled="!addProxyForm.valid"
            > {{ $t("common.add") }} </v-btn
          > </v-card-actions
        > </v-card
      > </v-dialog
    > <!-- 备用代理选择器 --> <v-dialog
      v-model="showFallbackSelector"
      max-width="500px"
      > <v-card
        > <v-card-title>{{ $t("proxy.selectFallback") }}</v-card-title
        > <v-card-text
          > <v-list
            > <v-list-item
              v-for="proxy in availableFallbackProxies"
              :key="proxy.name"
              @click="addFallback(proxy.name)"
              > <v-list-item-title>{{ proxy.name }}</v-list-item-title
              > <v-list-item-subtitle>{{ proxy.url }}</v-list-item-subtitle
              > <v-icon class="ml-auto">mdi-arrow-right</v-icon> </v-list-item
            > </v-list
          > </v-card-text
        > <v-card-actions
          > <v-btn @click="showFallbackSelector = false">{{
            $t("common.close")
          }}</v-btn
          > </v-card-actions
        > </v-card
      > </v-dialog
    > <!-- 测试结果提示 --> <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      > {{ snackbar.text }} </v-snackbar
    >
  </div>

</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { corsProxy } from "@/security/corsProxy";
const isProxyEnabled = ref(false);
const autoFallbackEnabled = ref(false);
const customProxies = ref([]);
const fallbackProxies = ref([]);
const activeProxyName = ref(null);
const stats = ref({
  totalRequests: 0,
  requestsLastHour: 0,
  rateLimitedRequests: 0,
  errorRequests: 0,
});
const showAddProxyDialog = ref(false);
const showFallbackSelector = ref(false);
const addProxyForm = reactive({ valid: false });
const newProxy = reactive({
  name: "",
  url: "",
  timeout: 30000,
  isFallback: false,
});
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
  timeout: 3000,
});
const availableFallbackProxies = computed(() => {
  return customProxies.value.filter(
    (p) => !fallbackProxies.value.includes(p.name),
  );
});
onMounted(() => {
  loadSettings();
  loadProxies();
  loadStats();
});
async function loadSettings() {
  isProxyEnabled.value = corsProxy.enabled;
  autoFallbackEnabled.value = true;
}
async function loadProxies() {
  customProxies.value = corsProxy.getCustomProxiesList();
  activeProxyName.value = corsProxy.activeProxy;
  fallbackProxies.value = [...corsProxy.fallbackProxies];
}
async function loadStats() {
  stats.value = corsProxy.getProxyStats();
}
function toggleProxy() {
  if (isProxyEnabled.value) {
    corsProxy.enable();
    showSnackbar($t("proxy.enabled"), "success");
  } else {
    corsProxy.disable();
    showSnackbar($t("proxy.disabled"), "info");
  }
}
function saveAutoFallback() {
  showSnackbar($t("proxy.autoFallbackSaved"), "success");
}
function showAddProxyDialogHandler() {
  newProxy.name = "";
  newProxy.url = "";
  newProxy.timeout = 30000;
  newProxy.isFallback = false;
  showAddProxyDialog.value = true;
}
async function addProxy() {
  const result = corsProxy.addCustomProxy(newProxy.name, {
    url: newProxy.url,
    timeout: newProxy.timeout,
  });
  if (result.success) {
    if (newProxy.isFallback) {
      corsProxy.addFallbackProxy(newProxy.name);
    }
    showAddProxyDialog.value = false;
    await loadProxies();
    showSnackbar($t("proxy.added"), "success");
  } else {
    showSnackbar(result.error, "error");
  }
}
async function deleteProxy(name) {
  corsProxy.removeCustomProxy(name);
  await loadProxies();
  showSnackbar($t("proxy.deleted"), "info");
}
async function setActiveProxy(name) {
  corsProxy.setActiveProxy(name);
  activeProxyName.value = name;
  showSnackbar($t("proxy.activeChanged", { name }), "success");
}
async function testProxy(proxy) {
  const result = await corsProxy.validateProxy(proxy.url);
  if (result.valid) {
    showSnackbar(
      $t("proxy.testSuccess", { code: result.responseCode }),
      "success",
    );
  } else {
    showSnackbar($t("proxy.testFailed", { error: result.error }), "error");
  }
}
function addFallback(name) {
  corsProxy.addFallbackProxy(name);
  fallbackProxies.value.push(name);
  showSnackbar($t("proxy.fallbackAdded", { name }), "success");
}
function removeFallback(name) {
  corsProxy.removeFallbackProxy(name);
  const index = fallbackProxies.value.indexOf(name);
  if (index > -1) {
    fallbackProxies.value.splice(index, 1);
  }
  showSnackbar($t("proxy.fallbackRemoved", { name }), "info");
}
function getProxyStatusColor(proxy) {
  return proxy.name === activeProxyName.value ? "success" : "grey";
}
function getProxyHealthColor(proxy) {
  const rate = getSuccessRate(proxy);
  if (rate >= 90) return "success";
  if (rate >= 70) return "warning";
  return "error";
}
function getProxyHealthStatus(proxy) {
  const rate = getSuccessRate(proxy);
  if (rate >= 90) return $t("proxy.healthy");
  if (rate >= 70) return $t("proxy.degraded");
  return $t("proxy.unhealthy");
}
function getSuccessRate(proxy) {
  const total = proxy.successCount + proxy.failCount;
  if (total === 0) return 100;
  return Math.round((proxy.successCount / total) * 100);
}
function showSnackbar(text, color) {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}
defineExpose({
  isProxyEnabled,
  customProxies,
  activeProxyName,
  addProxy,
  deleteProxy,
  setActiveProxy,
  testProxy,
});
</script>

<style scoped>
.cors-proxy-settings {
  padding: 16px;
}
</style>
