# ChatALL Web Access 性能测试清单

## 1. 构建优化测试

### 1.1 代码分割验证
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| vendor-core.js 存在 | ✅ 文件大小 < 500KB | `ls -la dist/js/vendor-core*.js` |
| vendor-vuetify.js 存在 | ✅ 文件大小 < 1MB | `ls -la dist/js/vendor-vuetify*.js` |
| vendor-markdown.js 存在 | ✅ 文件大小 < 800KB | `ls -la dist/js/vendor-markdown*.js` |
| vendor-langchain.js 存在 | ✅ 文件大小 < 2MB | `ls -la dist/js/vendor-langchain*.js` |
| runtime.js 存在 | ✅ 文件大小 < 50KB | `ls -la dist/js/runtime*.js` |
| 首屏 JS 总大小 | ✅ < 1.5MB | 统计初始加载的 JS 文件 |

### 1.2 压缩验证
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| Gzip 压缩 | ✅ .gz 文件存在 | `ls dist/js/*.gz` |
| Brotli 压缩 | ✅ .br 文件存在 | `ls dist/js/*.br` |
| 压缩率 | ✅ 原始大小的 30% 以下 | 对比原文件与压缩文件 |

### 1.3 Tree Shaking
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 未使用代码移除 | ✅ 生产构建无未使用警告 | `npm run build` 查看输出 |
| sideEffects 配置 | ✅ 正确配置 | 检查 vue.config.js |

## 2. 加载性能测试

### 2.1 首屏加载时间
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| FCP (First Contentful Paint) | ✅ < 2s | Lighthouse / Chrome DevTools |
| LCP (Largest Contentful Paint) | ✅ < 2.5s | Lighthouse / Chrome DevTools |
| TTI (Time to Interactive) | ✅ < 3s | Lighthouse / Chrome DevTools |
| TBT (Total Blocking Time) | ✅ < 300ms | Lighthouse / Chrome DevTools |
| CLS (Cumulative Layout Shift) | ✅ < 0.1 | Lighthouse / Chrome DevTools |

### 2.2 资源预加载验证
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 关键脚本预加载 | ✅ runtime.js、vendor-core.js、vendor-vuetify.js | Chrome DevTools Network |
| 字体预加载 | ✅ Roboto、Material Icons | Chrome DevTools Network |
| 预连接 | ✅ fonts.googleapis.com、static.geetest.com | Chrome DevTools Network |
| 非关键资源预取 | ✅ vendor-markdown.js、vendor-langchain.js | Chrome DevTools Network |

### 2.3 Bot 动态加载
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 首屏 Bot 加载数量 | ✅ 仅加载必要 Bot（5个以内） | Chrome DevTools Network |
| Bot 按需加载 | ✅ 点击后才加载对应 Bot 模块 | 模拟用户操作 |
| 加载缓存 | ✅ 同一 Bot 只加载一次 | Chrome DevTools Network |

## 3. 运行时性能

### 3.1 内存使用
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 初始内存占用 | ✅ < 200MB | Chrome DevTools Memory |
| 内存泄漏 | ✅ 无持续增长 | 长时间运行后检查 |
| GC 频率 | ✅ 合理范围 | Chrome DevTools Performance |

### 3.2 CPU 性能
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 首屏渲染 CPU 时间 | ✅ < 500ms | Chrome DevTools Performance |
| 空闲时 CPU 占用 | ✅ < 5% | Chrome DevTools Performance |
| 动画帧率 | ✅ 60fps | Chrome DevTools Performance |

### 3.3 响应性
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 按钮点击响应 | ✅ < 100ms | Chrome DevTools Performance |
| 路由切换时间 | ✅ < 300ms | Chrome DevTools Performance |
| Bot 列表渲染 | ✅ < 200ms | Chrome DevTools Performance |

## 4. 网络优化

### 4.1 请求数量
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 首屏请求数 | ✅ < 30 | Chrome DevTools Network |
| JS 请求数 | ✅ < 10 | Chrome DevTools Network |
| 字体请求数 | ✅ < 5 | Chrome DevTools Network |

### 4.2 请求大小
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| HTML 大小 | ✅ < 50KB | Chrome DevTools Network |
| CSS 大小 | ✅ < 100KB | Chrome DevTools Network |
| 首屏总大小 | ✅ < 2MB | Chrome DevTools Network |

### 4.3 缓存策略
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| Content Hash | ✅ 文件含 hash | `ls dist/js/*.js` |
| 静态资源缓存 | ✅ Cache-Control: max-age=31536000 | Chrome DevTools Network |
| HTML 缓存 | ✅ Cache-Control: no-cache | Chrome DevTools Network |

## 5. 移动端性能

### 5.1 加载性能
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 3G 网络加载时间 | ✅ < 10s | Chrome DevTools Throttling |
| 4G 网络加载时间 | ✅ < 5s | Chrome DevTools Throttling |
| 首屏可见时间 | ✅ < 3s | Chrome DevTools Throttling |

### 5.2 运行性能
| 测试项 | 预期结果 | 验证方法 |
|--------|----------|----------|
| 触摸响应 | ✅ < 100ms | Lighthouse Mobile |
| 滚动流畅度 | ✅ 60fps | Chrome DevTools Performance |
| 内存占用 | ✅ < 150MB | Chrome DevTools Memory |

## 6. 测试工具清单

### 6.1 必用工具
1. **Lighthouse** - 综合性能评估
2. **Chrome DevTools** - 详细性能分析
3. **WebPageTest** - 多地区多设备测试
4. **Bundle Analyzer** - 包体积分析

### 6.2 测试命令
```bash
# 构建并分析
npm run build

# Bundle Analyzer（需安装）
npx webpack-bundle-analyzer

# Lighthouse（Chrome 扩展）
# 在 Chrome 中运行 Lighthouse 审计
```

## 7. 性能指标达标标准

| 指标 | 优秀 | 良好 | 需优化 |
|------|------|------|--------|
| Lighthouse 总分 | ≥ 90 | 70-89 | < 70 |
| FCP | < 1.5s | 1.5-2.5s | > 2.5s |
| LCP | < 2s | 2-4s | > 4s |
| TTI | < 2.5s | 2.5-4.5s | > 4.5s |
| TBT | < 150ms | 150-300ms | > 300ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |

## 8. 性能监控建议

### 8.1 前端监控
- 集成 Google Analytics 或 Matomo 监控核心 Web 指标
- 使用 Real User Monitoring (RUM) 收集真实用户数据

### 8.2 定期测试
- 每次发布前运行性能测试
- 每周进行一次全面性能审计
- 建立性能预算，超过阈值自动告警

---

*文档版本: 1.0*  
*最后更新: 2026-06-10*
