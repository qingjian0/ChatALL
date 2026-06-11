import { createRouter, createWebHistory } from "vue-router"

const BASE_PATH = process.env.NODE_ENV === "production" ? "/ChatALL/" : "/"

const router = createRouter({
  history: createWebHistory(BASE_PATH),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/chat/:id",
      name: "ChatDetail",
      component: () => import("@/views/HomeView.vue"),
      props: (route) => ({ chatId: route.params.id }),
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("@/views/SettingsView.vue"),
      redirect: { name: "SettingsBots" },
      children: [
        {
          path: "bots",
          name: "SettingsBots",
          component: () => import("@/views/settings/BotsSettings.vue"),
        },
        {
          path: "appearance",
          name: "SettingsAppearance",
          component: () => import("@/views/settings/AppearanceSettings.vue"),
        },
        {
          path: "account",
          name: "SettingsAccount",
          component: () => import("@/views/settings/AccountSettings.vue"),
        },
        {
          path: "security",
          name: "SettingsSecurity",
          component: () => import("@/views/settings/SecuritySettings.vue"),
        },
        {
          path: "privacy",
          name: "SettingsPrivacy",
          component: () => import("@/views/settings/PrivacySettings.vue"),
        },
        {
          path: "advanced",
          name: "SettingsAdvanced",
          component: () => import("@/views/settings/AdvancedSettings.vue"),
        },
      ],
    },
    {
      path: "/about",
      name: "About",
      component: () => import("@/views/AboutView.vue"),
    },
    {
      path: "/help",
      name: "Help",
      component: () => import("@/views/HelpView.vue"),
    },
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/WelcomeView.vue"),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/lock",
      name: "Lock",
      component: () => import("@/views/LockView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: "smooth" }
    } else {
      return { top: 0, behavior: "smooth" }
    }
  },
})

router.beforeEach((to, from, next) => {
  const settingsStore = useSettingsStore()
  const secureStore = useSecureStore()

  if (to.name === "Lock") {
    next()
    return
  }

  if (
    settingsStore.settings.security.requirePasswordOnStartup &&
    !secureStore.isAuthenticated
  ) {
    next({ name: "Lock" })
    return
  }

  next()
})

router.afterEach((to) => {
  document.title = `ChatALL - ${to.name || "Home"}`
})

function useSettingsStore() {
  const { useSettingsStore: store } = require("@/stores/settingsStore")
  return store()
}

function useSecureStore() {
  const { useSecureStore: store } = require("@/stores/secureStore")
  return store()
}

export default router