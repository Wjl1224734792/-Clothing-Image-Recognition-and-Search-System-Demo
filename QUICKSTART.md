# 🚀 服装图片识别与搜索系统 - 快速启动指南

## 📋 系统概述

基于MVC/MVP架构的服装图片识别与搜索系统，使用Milvus向量数据库和Marqo/marqo-fashionSigLIP AI模型进行服装图片特征提取和相似性搜索。

## ⚡ 5分钟快速启动

### 1️⃣ 环境准备

确保已安装以下软件：
- **Node.js** (v16+) - [下载地址](https://nodejs.org/)
- **Docker & Docker Compose** - [下载地址](https://www.docker.com/)
- **Git** - [下载地址](https://git-scm.com/)

### 2️⃣ 启动Milvus数据库

```bash
# 启动Milvus向量数据库
docker-compose up -d

# 验证服务状态
docker-compose ps
```

**预期输出：**
```
Name                     Command               State           Ports
------------------------------------------------------------
milvus-standalone        /tini -- milvus run standalone   Up      0.0.0.0:19530->19530/tcp
```

### 3️⃣ 安装项目依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 4️⃣ 启动应用服务

**方式一：使用批处理文件（推荐）**
```bash
# 启动后端服务
start-backend.bat

# 启动前端服务（新终端窗口）
start-frontend.bat
```

**方式二：手动启动**
```bash
# 启动后端服务 (端口3001)
cd backend
npm run dev

# 启动前端服务 (端口5173) - 新终端窗口
cd frontend
npm run dev
```

### 5️⃣ 验证系统运行

访问以下地址确认系统正常运行：

- **前端界面**: http://localhost:5173 🎨
- **后端API**: http://localhost:3001 🔧
- **健康检查**: http://localhost:3001/api/health ✅
- **图片访问**: http://localhost:3001/uploads/ 📁

## 🎯 功能测试

### 图片上传测试
1. 打开 http://localhost:5173
2. 选择"图片上传"标签页
3. 点击或拖拽选择图片文件
4. 点击"开始上传"按钮
5. 查看上传成功提示

### 图片搜索测试
1. 选择"图片搜索"标签页
2. 选择搜索方式：
   - **上传图片**：选择图片文件
   - **图片URL**：输入图片链接
   - **选择图片转Base64**：选择图片自动转换
3. 点击"开始搜索"按钮
4. 查看搜索结果

## 🔧 配置说明

### 默认配置
- **后端端口**: 3001
- **前端端口**: 5173
- **Milvus端口**: 19530
- **Milvus账号**: root/Milvus

### 环境变量配置（可选）
创建 `backend/.env` 文件自定义配置：
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# Milvus配置
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_SSL=false
MILVUS_ADMIN_USER=root
MILVUS_ADMIN_PASSWORD=Milvus

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
MAX_FILES=10
```

## 🚨 常见问题

### 问题1：Milvus连接失败
**症状**: 后端启动时显示"Milvus连接健康检查失败"
**解决方案**:
```bash
# 检查Milvus是否运行
docker-compose ps

# 重启Milvus服务
docker-compose restart
```

### 问题2：端口被占用
**症状**: 启动时显示"EADDRINUSE"错误
**解决方案**:
```bash
# 检查端口占用
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 杀死占用进程
taskkill /PID <进程ID> /F
```

### 问题3：依赖安装失败
**症状**: npm install 失败
**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题4：图片上传失败
**症状**: 上传时显示"文件类型不支持"
**解决方案**:
- 确保图片格式为 jpg, jpeg, png, gif, webp
- 检查文件大小是否超过10MB
- 确保uploads目录存在且有写权限

## 📊 系统监控

### 健康检查接口
```bash
# 检查后端服务状态
curl http://localhost:3001/api/health

# 检查Milvus集合状态
curl http://localhost:3001/api/health/collection
```

### 日志查看
```bash
# 查看后端日志
cd backend
npm run dev

# 查看Milvus日志
docker-compose logs milvus-standalone
```

## 🎨 界面预览

### 主界面功能
- **图片上传**: 支持批量上传，拖拽操作
- **图片搜索**: 三种搜索方式，实时结果展示
- **响应式设计**: 适配桌面和移动设备

### 搜索方式
1. **文件上传搜索**: 选择本地图片文件
2. **URL搜索**: 输入网络图片链接
3. **Base64搜索**: 选择图片自动转换为Base64

## 🔄 开发模式

### 热重载开发
```bash
# 后端热重载
cd backend
npm run dev

# 前端热重载
cd frontend
npm run dev
```

### 代码结构
```
智能图片搜索系统/
├── frontend/          # Vue 3前端 (MVP架构)
├── backend/           # Express后端 (MVC架构)
├── uploads/           # 图片存储目录
└── docker-compose.yml # Milvus配置
```

## 📚 相关文档

- [完整项目文档](./README.md) - 详细的项目说明
- [后端API文档](./backend/README.md) - 后端服务详细说明
- [前端开发文档](./frontend/README.md) - 前端应用详细说明
- [API接口文档](./backend/API-文档.md) - 完整的API接口说明

## 🆘 获取帮助

如果遇到问题，请检查：
1. 所有服务是否正常运行
2. 端口是否被占用
3. 依赖是否正确安装
4. Milvus数据库是否启动

## 🎉 开始使用

现在你已经成功启动了智能图片搜索系统！

- 上传一些图片到系统中
- 尝试使用不同的搜索方式
- 体验AI驱动的图片相似度搜索功能

**祝您使用愉快！** 🚀✨
