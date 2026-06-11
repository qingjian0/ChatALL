import { createApp } from "vue"
import App from "./App.vue"
import i18n from "./i18n"
import router from "./router"
import { createPinia } from "pinia"

import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n"
import { useI18n } from "vue-i18n"
import { resolveTheme, applyTheme } from "./theme"

import "vuetify/styles"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

const pinia = createPinia()

const vuetify = createVuetify({
  components: { ...components },
  directives,
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#062AAA",
          surface: "#FFFFFF",
          background: "#f3f3f3",
          "surface-variant": "#fff",
          "on-surface-variant": "#212121",
          header: "#fff",
          prompt: "#95ec69",
          response: "#fff",
          font: "#212121",
          "table-tr-2n": "#F6F8FA",
          "code-font": "#476582",
          "code-background": "#F3F4F4",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#ececf1",
          surface: "#292a2d",
          background: "#1a1a20",
          "surface-variant": "#131419",
          "on-surface-variant": "#fff",
          header: "#292a2d",
          prompt: "#222329",
          response: "#131419",
          font: "#fff",
          "table-tr-2n": "#1d1e20",
          "code-font": "#cbdae6",
          "code-background": "#292a2d",
        },
      },
    },
  },
})

const app = createApp(App)

app.use(i18n)
app.use(pinia)
app.use(router)
app.use(vuetify)

const loadOptionalDependencies = async () => {
  try {
    const [VueShortkey, VMdPreviewModule] = await Promise.all([
      import("vue3-shortkey"),
      import("@kangc/v-md-editor/lib/preview"),
    ])

    import("material-design-icons/iconfont/material-icons.css")
    import("@kangc/v-md-editor/lib/style/preview.css")
    import("@kangc/v-md-editor/lib/theme/style/vuepress.css")
    import("@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css")
    import("@kangc/v-md-editor/lib/style/base-editor.css")
    import("@kangc/v-md-editor/lib/theme/style/github.css")

    const [
      createLineNumbertPlugin,
      createCopyCodePlugin,
      vuepressTheme,
      Prism,
      createKatexPlugin,
    ] = await Promise.all([
      import("@kangc/v-md-editor/lib/plugins/line-number/index"),
      import("@kangc/v-md-editor/lib/plugins/copy-code/index"),
      import("@kangc/v-md-editor/lib/theme/vuepress.js"),
      import("prismjs"),
      import("@kangc/v-md-editor/lib/plugins/katex/npm"),
    ])

    VMdPreviewModule.default
      .use(vuepressTheme.default, { Prism: Prism.default })
      .use(createLineNumbertPlugin.default())
      .use(createCopyCodePlugin.default())
      .use(createKatexPlugin.default())

    app.use(VMdPreviewModule.default)
    app.use(VueShortkey.default)
  } catch (error) {
    console.warn("Failed to load optional dependencies:", error)
  }
}

const initApp = async () => {
  applyTheme(resolveTheme())

  await loadOptionalDependencies()

  app.mount("#app")
}

initApp()