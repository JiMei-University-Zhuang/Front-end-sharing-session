const express = require('express');
const path = require('path');
const app = express();

// 添加中间件
app.use(express.json());  // 处理 JSON 格式的请求体
app.use(express.urlencoded({ extended: true }));  // 处理 URL 编码的请求体
app.use(express.static('public'));

// 模拟数据库中的内容
let content = {
    message: 'Initial content',
    lastUpdated: Date.now()
};

// 更新内容的辅助函数
function updateContent() {
    content = {
        message: `Content updated at ${new Date().toLocaleTimeString()}`,
        lastUpdated: Date.now()
    };
}

// 1. 强缓存 - Cache-Control
app.get('/cache-control', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=10'); // 缓存10秒
    res.json({ message: 'This response will be cached for 10 seconds', time: Date.now() });
});

// 2. 强缓存 - Expires
app.get('/expires', (req, res) => {
    const expiresDate = new Date(Date.now() + 10000); // 10秒后过期
    res.setHeader('Expires', expiresDate.toUTCString());
    res.json({ message: 'This response will expire in 10 seconds', time: Date.now() });
});

// 3. 协商缓存 - Last-Modified
let lastModifiedTime = new Date();
app.get('/last-modified', (req, res) => {
    const ifModifiedSince = req.headers['if-modified-since'];
    
    // 设置 Last-Modified
    res.setHeader('Last-Modified', lastModifiedTime.toUTCString());
    
    // 如果请求头有 If-Modified-Since，且内容未更新，返回 304
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() === lastModifiedTime.getTime()) {
        console.log('Last-Modified: 内容未修改，返回 304');
        return res.status(304).end();
    }

    console.log('Last-Modified: 内容已修改或首次请求，返回新内容');
    res.json({
        data: content,
        lastModified: lastModifiedTime.toUTCString()
    });
});

// 4. 协商缓存 - ETag
function generateETag(content) {
    return require('crypto')
        .createHash('md5')
        .update(JSON.stringify(content))
        .digest('hex');
}

app.get('/etag', (req, res) => {
    const currentETag = generateETag(content);
    const ifNoneMatch = req.headers['if-none-match'];
    
    // 设置 ETag
    res.setHeader('ETag', currentETag);
    
    // 如果请求头有 If-None-Match，且 ETag 匹配，返回 304
    if (ifNoneMatch && ifNoneMatch === currentETag) {
        console.log('ETag: 内容未修改，返回 304');
        return res.status(304).end();
    }

    console.log('ETag: 内容已修改或首次请求，返回新内容');
    res.json({
        data: content,
        etag: currentETag
    });
});

// 5. 不缓存
app.get('/no-cache', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ message: 'This response will never be cached', time: Date.now() });
});

// 6. 组合使用
app.get('/combined', (req, res) => {
    const currentETag = generateETag(content);
    
    res.setHeader('Cache-Control', 'public, max-age=10');
    res.setHeader('ETag', currentETag);
    res.setHeader('Last-Modified', lastModifiedTime.toUTCString());

    if (req.headers['if-none-match'] === currentETag) {
        return res.status(304).end();
    }

    res.json({
        data: content,
        etag: currentETag,
        lastModified: lastModifiedTime.toUTCString()
    });
});

// 7. 手动更新内容的接口
app.post('/update-content', (req, res) => {
    console.log('Updating content...'); // 添加日志
    updateContent();
    lastModifiedTime = new Date();
    res.json({ 
        message: 'Content updated successfully',
        timestamp: new Date().toLocaleTimeString() 
    });
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT} to test different caching strategies`);
});