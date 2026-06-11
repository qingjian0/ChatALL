const { defineConfig } = require("@vue/cli-service");
let CompressionPlugin = null;
try {
  CompressionPlugin = require("compression-webpack-plugin");
} catch (e) {
  console.warn("[vue.config] compression-webpack-plugin not available");
}
const zlib = require("zlib");

const BASE_PATH = process.env.NODE_ENV === "production" ? "/ChatALL/" : "/";

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  publicPath: BASE_PATH,
  outputDir: "dist",
  assetsDir: "static",
  productionSourceMap: false,

  configureWebpack: {
    resolve: {
      alias: {
        "@": require("path").resolve(__dirname, "src"),
      },
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendorCore: {
            name: "vendor-core",
            test: /[\\/]node_modules[\\/](vue|pinia|vue-i18n|vue-router)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          vendorVuetify: {
            name: "vendor-vuetify",
            test: /[\\/]node_modules[\\/](vuetify|@mdi)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
          vendorMarkdown: {
            name: "vendor-markdown",
            test: /[\\/]node_modules[\\/](@kangc\/v-md-editor|prismjs|katex)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          vendorCommon: {
            name: "vendor-common",
            test: /[\\/]node_modules[\\/](?!(vue|pinia|vue-i18n|vue-router|vuetify|@mdi|@kangc\/v-md-editor|prismjs|katex))[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    },
    plugins: (() => {
      const plugins = [];
      if (CompressionPlugin) {
        plugins.push(
          new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
            compressionOptions: { level: 9 },
          }),
          new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
            compressionOptions: { level: 11 },
          })
        );
      }
      return plugins;
    })(),
  },

  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "ChatALL - Chat with all AI models";
      return args;
    });
  },

  devServer: {
    port: 8080,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "https://api.chatall.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});