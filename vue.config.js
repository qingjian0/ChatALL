const { defineConfig } = require("@vue/cli-service");
let CompressionPlugin = null;
try {
  CompressionPlugin = require("compression-webpack-plugin");
} catch (e) {
  console.warn("[vue.config] compression-webpack-plugin not available");
}
const zlib = require("zlib");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const BASE_PATH = process.env.NODE_ENV === "production" ? "/ChatALL/" : "/";

class NodeProtocolPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap("NodeProtocolPlugin", (nmf) => {
      nmf.hooks.beforeResolve.tap("NodeProtocolPlugin", (resolveData) => {
        if (resolveData.request && resolveData.request.startsWith("node:")) {
          resolveData.request = resolveData.request.replace("node:", "");
        }
      });
    });
  }
}

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  publicPath: BASE_PATH,
  outputDir: "dist",
  assetsDir: "static",
  productionSourceMap: false,
  lintOnSave: false,

  configureWebpack: {
    resolve: {
      alias: {
        "@": require("path").resolve(__dirname, "src"),
        "crypto": "crypto-browserify",
        "stream": "stream-browserify",
        "os": "os-browserify/browser",
        "path": "path-browserify",
      },
      fallback: {
        "fs": false,
        "child_process": false,
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "util": require.resolve("util/"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "path": require.resolve("path-browserify"),
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
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
      const plugins = [new NodePolyfillPlugin(), new NodeProtocolPlugin()];
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
    
    config.resolve.set('fallback', {
      'fs': false,
      'child_process': false,
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'util': require.resolve('util/'),
      'buffer': require.resolve('buffer/'),
      'process': require.resolve('process/browser'),
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'os': require.resolve('os-browserify/browser'),
      'path': require.resolve('path-browserify'),
    });
    
    config.module
      .rule('node')
      .test(/\.m?js/)
      .resolve.set('fullySpecified', false);
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