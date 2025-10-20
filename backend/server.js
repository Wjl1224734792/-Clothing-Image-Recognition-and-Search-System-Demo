import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { env } from '@huggingface/transformers';

// 导入路由
import imagesRouter from './src/routers/images-router.js';
import healthRouter from './src/routers/health-router.js';
import { ImagesController } from './src/controllers/images-controller.js';

// 导入中间件
import { errorMiddleware, notFoundMiddleware } from './src/middlewares/error-middleware.js';

// ES模块兼容性处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件配置
app.use(cors({
  origin: config.nodeEnv === 'production' ? ['https://yourdomain.com'] : true,
  credentials: true
}));

// 请求体解析
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务 - 提供图片直接访问
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  // 设置缓存控制
  maxAge: '1d',
  // 设置索引文件
  index: false,
  // 处理错误
  fallthrough: false
}));
app.use('/static', express.static(uploadsPath, {
  maxAge: '1d',
  index: false,
  fallthrough: false
}));

// 配置Transformers.js缓存
env.cacheDir = config.model.cacheDir;
env.allowRemoteModels = true;

// 图片服务路由 - 处理各种路径格式的图片请求
app.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  
  // 安全检查：防止路径遍历攻击
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: '无效的文件名' });
  }
  
  const imagePath = path.join(uploadsPath, filename);
  
  // 检查文件是否存在
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: '图片文件不存在' });
  }
  
  // 设置正确的Content-Type
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp'
  };
  
  const contentType = mimeTypes[ext] || 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存1天
  
  // 发送文件
  res.sendFile(imagePath);
});

// 处理绝对路径的图片请求
app.get('/image-absolute/*', (req, res) => {
  try {
    // 获取完整路径
    const fullPath = req.params[0];
    
    // 安全检查：防止路径遍历攻击
    if (fullPath.includes('..')) {
      return res.status(400).json({ error: '无效的文件路径' });
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: '图片文件不存在' });
    }
    
    // 设置正确的Content-Type
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp'
    };
    
    const contentType = mimeTypes[ext] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存1天
    
    // 发送文件
    res.sendFile(fullPath);
  } catch (error) {
    console.error('❌ 处理绝对路径图片失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// API路由
app.use('/api/images', imagesRouter);
app.use('/api/health', healthRouter);

// 根路径健康检查
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '图片搜索服务运行中',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      images: '/api/images',
      upload: '/api/images/upload',
      search: '/api/images/search'
    }
  });
});

// 404处理
app.use(notFoundMiddleware);

// 全局错误处理
app.use(errorMiddleware);

/**
 * 初始化服务器
 * 创建必要目录，初始化Milvus集合，启动服务
 */
async function startServer() {
  try {
    console.log('🚀 启动MVC架构的图片搜索服务...');
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('📁 创建上传目录:', uploadsPath);
    }
    
    // 确保缓存目录存在
    const cacheDir = path.join(__dirname, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log('🗂️ 创建缓存目录:', cacheDir);
    }
    
    // 确保临时目录存在
    const tempDir = path.join(__dirname, config.temp.dir);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('📂 创建临时目录:', tempDir);
    }
    
    const port = config.port;
    app.listen(port, () => {
      console.log(`🎉 MVC架构后端服务器启动成功！`);
      console.log(`🌐 服务地址: http://localhost:${port}`);
      console.log(`📁 上传目录: ${uploadsPath}`);
      console.log(`🤖 模型缓存目录: ${config.model.cacheDir}`);
      console.log(`🔧 Transformers缓存目录: ${env.cacheDir}`);
      console.log(`\n📋 API端点:`);
      console.log(`   🏠 首页: http://localhost:${port}/`);
      console.log(`   ❤️ 健康检查: http://localhost:${port}/api/health`);
      console.log(`   📸 图片管理: http://localhost:${port}/api/images`);
      console.log(`   📤 上传图片: http://localhost:${port}/api/images/upload`);
      console.log(`   🔍 搜索图片: http://localhost:${port}/api/images/search`);
      console.log(`\n🏗️ 架构信息:`);
      console.log(`   📦 MVC架构: 控制器 → 服务 → 仓库 → 模型`);
      console.log(`   🗄️ 向量数据库: Milvus (${config.milvus.host}:${config.milvus.port})`);
      console.log(`   🤖 AI模型: ${config.model.name} (${config.model.vectorDimension}维)`);
      console.log(`   📊 集合名称: ${config.vector.collectionName}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 初始化控制器
const imagesController = new ImagesController();

// 启动服务器
async function startServerWithInit() {
  try {
    // 启动服务器
    await startServer();
    
    // 初始化控制器
    console.log('\n🔧 正在初始化系统...');
    await imagesController.initialize();
    console.log('🎉 系统初始化完成，服务就绪！');
  } catch (error) {
    console.error('❌ 系统启动失败:', error);
    process.exit(1);
  }
}

startServerWithInit();
