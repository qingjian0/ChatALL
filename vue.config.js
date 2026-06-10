const { defineConfig } = require("@vue/cli-service");
const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");

module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  
  // 配置公共路径 - GitHub Pages 部署使用 /ChatALL/
  publicPath: process.env.NODE_ENV === "production" ? "/ChatALL/" : "/",
  
  // 输出配置
  outputDir: "dist",
  assetsDir: "assets",
  filenameHashing: true,
  
  // 代码分割配置
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          // Vendor 核心依赖：vue + pinia + vue-i18n + vue-router
          vendorCore: {
            name: "vendor-core",
            test: /[\\/]node_modules[\\/](vue|pinia|vue-i18n|vue-router|@vue)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // Vuetify 单独分割
          vendorVuetify: {
            name: "vendor-vuetify",
            test: /[\\/]node_modules[\\/](vuetify|@mdi)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Markdown 相关依赖
          vendorMarkdown: {
            name: "vendor-markdown",
            test: /[\\/]node_modules[\\/](@kangc\/v-md-editor|prismjs|katex)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // LangChain 相关依赖
          vendorLangchain: {
            name: "vendor-langchain",
            test: /[\\/]node_modules[\\/](langchain|@langchain)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
          },
          // 其他通用依赖
          vendorCommon: {
            name: "vendor-common",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
            exclude: /[\\/]node_modules[\\/](vue|pinia|vue-i18n|vue-router|vuetify|@mdi|@kangc\/v-md-editor|prismjs|katex|langchain|@langchain)[\\/]/,
          },
        },
      },
      runtimeChunk: {
        name: "runtime",
      },
    },
    plugins: [
      // Gzip 压缩
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
        compressionOptions: { level: 9 },
      }),
      // Brotli 压缩
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
        compressionOptions: { level: 11 },
      }),
    ],
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        "@": require("path").resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024, // 10kb 以下转为 base64
            },
          },
        },
      ],
    },
  },
  
  // CSS 配置
  css: {
    extract: true,
    sourceMap: process.env.NODE_ENV !== "production",
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  
  // DevServer 配置
  devServer: {
    compress: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Custom-Header",
    },
    // CORS 代理配置
    proxy: {
      "/api/proxy": {
        target: "https://api.chatall.app",
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          "^/api/proxy": "",
        },
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader("X-Proxy-Source", "dev-server");
          proxyReq.setHeader("X-Request-Id", generateRequestId());
        },
        onProxyRes: (proxyRes, req, res) => {
          proxyRes.headers["Access-Control-Allow-Origin"] = "*";
          proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
        },
        timeout: 60000,
      },
      // OpenAI API 代理
      "/api/openai": {
        target: "https://api.openai.com",
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          "^/api/openai": "",
        },
      },
      // Anthropic API 代理
      "/api/anthropic": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          "^/api/anthropic": "",
        },
      },
      // Google API 代理
      "/api/google": {
        target: "https://generativelanguage.googleapis.com",
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          "^/api/google": "",
        },
      },
      // 通用代理端点
      "/api/v1/proxy": {
        target: "https://chatall-proxy.workers.dev",
        changeOrigin: true,
        secure: true,
        pathRewrite: {
          "^/api/v1/proxy": "",
        },
      },
    },
  },
  
  // 生产环境 Source Map 控制 - 始终生成 Source Map
  productionSourceMap: true,
  
  // Electron Builder 配置
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: "src/background.js",
      mainProcessPreload: "src/preload.js",
      builderOptions: {
        appId: "ai.chatall",
        productName: "ChatALL",
        artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
        directories: {
          buildResources: "src/assets",
        },
        compression: "maximum",
        mac: {
          category: "public.app-category.utilities",
          target: "default",
          icon: "src/assets/icon.icns",
        },
        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64"],
            },
          ],
          icon: "src/assets/icon.ico",
        },
        linux: {
          target: ["AppImage", "deb"],
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
        },
      },
      customFileProtocol: "./",
    },
  },
});

// 生成唯一请求 ID
function generateRequestId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
