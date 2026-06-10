# ChatALL API Gateway - Nginx 部署指南

## 目录结构

```
deploy/nginx/
├── chatall-proxy.conf    # 主配置文件
├── errors/               # 错误页面
│   ├── 403.json
│   ├── 429.json
│   └── 5xx.json
└── README.md             # 部署说明
```

## 部署步骤

### 1. 安装依赖

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install nginx certbot python3-certbot-nginx
```

### 2. 创建目录结构

```bash
sudo mkdir -p /etc/nginx/ssl
sudo mkdir -p /var/www/chatall-proxy/errors
sudo mkdir -p /var/log/nginx
```

### 3. 复制配置文件

```bash
sudo cp chatall-proxy.conf /etc/nginx/conf.d/
sudo cp errors/*.json /var/www/chatall-proxy/errors/
```

### 4. 获取 SSL 证书

```bash
sudo certbot --nginx -d chatall-proxy.example.com
```

### 5. 验证配置并重启

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 配置说明

### 主要配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `limit_req` | 请求限流 | 100 请求/分钟 |
| `limit_conn` | 连接限流 | 10 连接/IP |
| `proxy_connect_timeout` | 连接超时 | 10s |
| `proxy_send_timeout` | 发送超时 | 60s |
| `proxy_read_timeout` | 读取超时 | 60s |

### 环境变量

```bash
# 在启动前设置环境变量
export PROXY_DOMAIN="chatall-proxy.example.com"
export SSL_CERT_PATH="/etc/nginx/ssl/chatall-proxy.crt"
export SSL_KEY_PATH="/etc/nginx/ssl/chatall-proxy.key"
```

## 监控与日志

### 访问日志

```bash
tail -f /var/log/nginx/proxy-access.log
```

### 错误日志

```bash
tail -f /var/log/nginx/error.log
```

### 状态监控

```bash
curl http://localhost/status
```

## 安全建议

1. **限制管理端口访问**：仅允许内网 IP 访问 8443 端口
2. **定期更新证书**：设置 certbot 自动更新
3. **监控日志**：配置日志轮转和告警
4. **禁用不必要的模块**：减少攻击面

## 故障排除

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 403 错误 | Origin 不在白名单 | 检查 `$http_origin` 正则匹配 |
| 502 错误 | 上游服务器不可达 | 检查上游配置和网络连通性 |
| SSL 证书错误 | 证书路径错误 | 检查 `ssl_certificate` 配置 |

### 测试命令

```bash
# 测试 CORS 预检请求
curl -X OPTIONS https://chatall-proxy.example.com/api/v1/proxy/openai/chat/completions \
  -H "Origin: https://chatall.app"

# 测试代理请求
curl https://chatall-proxy.example.com/api/v1/proxy/openai/chat/completions \
  -H "Origin: https://chatall.app" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello"}]}'
```