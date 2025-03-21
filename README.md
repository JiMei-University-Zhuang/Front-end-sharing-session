# HTTP Cache Demo

这是一个演示 HTTP 缓存机制的 Express 应用

## 功能特性

- 强缓存 (Cache-Control, Expires)
- 协商缓存 (Last-Modified, ETag)
- 实时内容更新
- 可视化的缓存效果展示

## 安装

```bash
npm install
```

## 运行

```bash
node app.js
```

访问 http://localhost:5500

## 缓存策略演示

1. Cache-Control
2. Expires
3. Last-Modified
4. ETag
5. No Cache
6. Combined Strategy

## 使用说明

1. 使用浏览器开发者工具的 Network 面板
2. 点击不同的按钮测试各种缓存策略
3. 观察请求的状态码和响应头
4. 特别注意协商缓存时的 304 状态码
