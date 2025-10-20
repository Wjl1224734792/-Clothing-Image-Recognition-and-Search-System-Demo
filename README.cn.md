# 👗 服装图片识别与搜索系统（本地部署测试用demo）

基于MVC/MVP架构的智能服装图片识别与搜索系统，使用Milvus向量数据库和Marqo/marqo-fashionSigLIP AI模型进行服装图片特征提取和相似性搜索。

## ✨ 功能特性

- 👗 **服装识别**：专门针对服装图片的AI识别和特征提取
- 🔍 **智能搜索**：基于Marqo/marqo-fashionSigLIP模型的服装图片相似度搜索
- 📁 **批量上传**：支持多张服装图片同时上传和向量化存储
- 🎨 **多种搜索方式**：支持文件上传、URL、Blob等多种服装图片搜索方式
- ⚡ **高性能**：使用Milvus向量数据库，支持大规模服装图片搜索
- 🔒 **安全可靠**：文件类型验证，路径安全检查
- 🏗️ **架构清晰**：前后端分离，MVC/MVP架构设计
- 🧠 **AI驱动**：使用Marqo/marqo-fashionSigLIP模型进行服装特征提取
- 📱 **响应式设计**：适配不同设备屏幕尺寸
- 🆔 **UUID文件命名**：前端生成UUID，后端使用UUID作为文件名保存，避免文件名冲突
- 🔗 **关联管理**：支持correlation_id关联管理，提供删除、更新、查询操作
- 🎯 **专业优化**：针对服装图片优化的768维特征向量

## 🏗️ 技术架构

### 前端架构 (MVP)
- **Vue 3** - 现代化前端框架，使用Composition API
- **Vite** - 快速构建工具
- **Axios** - HTTP客户端
- **MVP模式** - Model-View-Presenter架构

### 后端架构 (MVC)
- **Express.js** - Node.js Web框架
- **Multer** - 文件上传处理
- **@huggingface/transformers** - AI模型推理
- **MVC模式** - Model-View-Controller架构

### 数据库与存储
- **Milvus** - 向量数据库，支持大规模向量搜索
- **本地存储** - 图片文件本地存储

### AI模型
- **Marqo/marqo-fashionSigLIP** - 专门针对服装图片的特征提取模型
- **768维向量** - 固定768维服装特征表示
- **自动特征提取** - 自动处理服装图片预处理和特征提取
- **服装识别优化** - 针对服装、配饰等时尚物品的识别优化

## 📁 项目结构

```
服装图片识别与搜索系统/
├── frontend/                    # Vue 3前端项目 (MVP架构)
│   ├── src/
│   │   ├── components/         # Vue组件
│   │   ├── models/             # 数据模型
│   │   ├── services/           # 服务层
│   │   ├── presenters/         # 展示器
│   │   ├── App.vue             # 主应用组件
│   │   └── main.js             # 应用入口
│   ├── package.json            # 前端依赖
│   └── vite.config.js          # Vite配置
├── backend/                     # Express后端项目 (MVC架构)
│   ├── src/
│   │   ├── controllers/        # 控制器层
│   │   ├── services/           # 服务层
│   │   ├── repositories/        # 数据访问层
│   │   ├── models/             # 数据模型
│   │   ├── middlewares/        # 中间件
│   │   ├── routers/            # 路由
│   │   ├── utils/              # 工具类
│   │   └── enums/              # 枚举
│   ├── uploads/                # 图片存储目录
│   ├── config.js               # 配置文件
│   ├── server.js               # 服务器入口
│   └── package.json            # 后端依赖
├── uploads/                     # 图片存储（共享）
├── docker-compose.yml           # Milvus部署配置
└── README.md                    # 项目说明文档
```

## 🚀 快速开始

### 1. 环境准备

确保已安装以下软件：
- Node.js (v16+)
- Docker & Docker Compose
- Git

### 2. 启动Milvus服务

```bash
# 启动Milvus向量数据库
docker-compose up -d

# 验证服务状态
docker-compose ps
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 4. 启动应用

```bash
# 启动后端服务 (端口3001)
cd backend
npm run dev

# 启动前端服务 (端口5173)
cd frontend
npm run dev
```

### 5. 访问应用

- **前端界面**：http://localhost:5173
- **后端API**：http://localhost:3001
- **健康检查**：http://localhost:3001/api/health
- **图片访问**：http://localhost:3001/uploads/

## 📖 使用说明

### 服装图片上传功能
1. 选择"图片上传"标签页
2. 点击或拖拽选择多张服装图片文件
3. 点击"开始上传"按钮上传服装图片
4. 系统自动计算服装图片特征向量并存储到Milvus

### 服装图片搜索功能
1. 选择"图片搜索"标签页
2. 支持三种搜索方式：
   - **上传图片**：选择服装图片文件进行搜索
   - **图片URL**：输入服装图片URL进行搜索
   - **选择图片转Blob**：选择服装图片文件自动转换为Blob格式搜索
3. 点击"开始搜索"按钮进行服装相似度搜索
4. 查看搜索结果，按相似度排序显示匹配的服装图片

## 🔧 配置说明

### 环境变量配置

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
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
MAX_FILES=10

# 模型配置
MODEL_CACHE_DIR=./.cache
MODEL_NAME=Marqo/marqo-fashionSigLIP
```

## 🛠️ 开发指南

### 架构说明

#### 后端MVC架构
- **Controller**: 处理HTTP请求和响应
- **Service**: 业务逻辑处理
- **Repository**: 数据访问层，与Milvus交互
- **Model**: 数据模型定义

#### 前端MVP架构
- **Model**: 数据模型和状态管理
- **View**: Vue组件，用户界面
- **Presenter**: 业务逻辑处理，连接Model和View
- **Service**: API通信服务

### 添加新功能

#### 后端开发
1. 在`controllers/`中创建控制器方法
2. 在`services/`中实现业务逻辑
3. 在`repositories/`中添加数据访问
4. 在`routers/`中注册路由

#### 前端开发
1. 在`components/`中创建Vue组件
2. 在`presenters/`中实现业务逻辑
3. 在`services/`中添加API调用
4. 在`models/`中定义数据结构

### 自定义搜索参数

```javascript
// 修改搜索参数
const searchParams = {
  metric_type: 'L2',
  params: { nprobe: 10 },
  limit: 20
};
```

## 📊 性能优化

- **服装图片压缩**：自动调整服装图片尺寸
- **缓存机制**：Marqo/marqo-fashionSigLIP模型文件本地缓存
- **批量处理**：支持批量服装图片上传
- **向量索引**：使用HNSW索引提升服装搜索速度
- **集合预加载**：集合预加载到内存
- **临时文件清理**：搜索时自动清理临时文件
- **向量归一化**：L2归一化提升服装搜索准确性

## 🔒 安全特性

- **文件类型验证**：只允许图片格式
- **文件大小限制**：防止大文件攻击
- **路径安全检查**：防止目录遍历攻击
- **安全文件名**：防止文件名冲突

## 📝 更新日志

### v2.1.0 (2025-10-18)
- 🎯 **前端架构优化**：
  - 修复图片上传进度条显示问题，使用真实进度跟踪替代模拟进度
  - 重构 `ApiService` 使用 `XMLHttpRequest` 实现实时进度回调
  - 优化 `ImagePresenter` 进度管理逻辑，添加延迟重置机制
  - 清理未使用的代码：删除 `ImageView` 接口和 `views` 目录
  - 简化项目结构，提升代码可维护性
- 🧹 **代码清理**：移除冗余代码，优化项目结构
- 📈 **用户体验提升**：真实进度反馈，更流畅的上传体验
- 📚 **文档统一**：删除前后端独立README文档，统一使用根目录README.md
- 📖 **文档完善**：整合API接口、组件说明、配置说明等完整文档
- 🔧 **API接口优化**：新增Blob格式支持，提供更灵活的图像处理方式
- 🎨 **前端Blob支持**：将Base64搜索改为Blob搜索，提升性能和兼容性

### v2.0.0 (2025-10-17)
- 🏗️ **架构重构**：采用MVC/MVP架构设计
- 🎨 **前端重构**：Vue 3 + MVP架构
- 🔧 **后端重构**：Express + MVC架构
- 📱 **响应式设计**：适配不同设备屏幕
- 👗 **服装识别优化**：专门针对服装图片的AI识别和搜索
- 🔍 **多种搜索方式**：支持文件上传、URL、Base64搜索
- ⚡ **性能优化**：优化启动日志，提升用户体验
- 🗑️ **功能精简**：移除图片列表功能，专注核心搜索功能
- 🔗 **关联管理**：新增correlation_id管理功能，支持删除、更新、查询操作
- 📚 **文档完善**：更新API文档，添加快速启动指南

### v1.0.0 (2025-10-10)
- ✨ 初始版本发布
- 👗 完整的服装图片识别与搜索功能
- 🚀 前后端分离架构
- 🔧 Milvus向量数据库集成

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📡 API接口文档

### 基础信息
- **服务地址**: `http://localhost:3001`
- **健康检查**: `http://localhost:3001/api/health`

### 核心接口

#### 1. 图片上传插入
```http
POST /api/images/upload
Content-Type: multipart/form-data

# 参数
images: File[] (图片文件数组)
uuids: string[] (UUID数组，用于文件命名)
correlation_id: string (可选，关联ID)
```

#### 2. 字符串方式插入
```http
POST /api/images/insert
Content-Type: application/json

{
  "image_path": "path/to/image.jpg",
  "image_data": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "correlation_id": "user_001"
}
```

#### 3. Blob方式插入
```http
POST /api/images/insert/blob
Content-Type: application/json

{
  "image_blob": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "correlation_id": "user_001"
}
```

#### 4. 文件上传搜索
```http
POST /api/images/search/upload
Content-Type: multipart/form-data

# 参数
image: File (搜索图片文件)
limit: number (可选，默认20)
```

#### 5. 字符串方式搜索
```http
POST /api/images/search
Content-Type: application/json

{
  "image_path": "path/to/image.jpg",
  "image_data": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "limit": 20
}
```

#### 6. Blob方式搜索
```http
POST /api/images/search/blob
Content-Type: application/json

{
  "image_blob": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "limit": 20
}
```

#### 7. 根据correlation_id操作
```http
# 删除
DELETE /api/images/correlation/:correlationId

# 查询
GET /api/images/correlation/:correlationId
```

#### 8. 更新嵌入数据接口
```http
# 文件上传方式更新嵌入数据
POST /api/images/correlation/:correlationId/update/upload
Content-Type: multipart/form-data

# 参数
images: File[] (图片文件数组)
correlation_id: string (关联ID，从URL路径获取)

# 字符串方式更新嵌入数据
POST /api/images/correlation/:correlationId/update/string
Content-Type: application/json

{
  "image_path": "path/to/image.jpg",
  "image_data": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg"
}

# Blob方式更新嵌入数据
POST /api/images/correlation/:correlationId/update/blob
Content-Type: application/json

{
  "image_blob": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg"
}
```

#### 9. 本地批量导入（通过文件路径）
```http
POST /api/images/batch-insert
Content-Type: application/json

{
  "image_paths": [
    "D:/dataset/fashion/001.jpg",
    "./imageDataColection/img/top/002.png"
  ],
  "correlation_id": "batch_20251020",
  "batch_name": "autumn_collection"
}
```

- 说明：
  - `image_paths` 支持绝对/相对路径；相对路径以后端进程工作目录为基准。
  - 后端为每张图片生成768维向量并写入Milvus，`file_path`以绝对路径保存。
  - 返回数组包含每条记录的处理结果（`status`、`filePath`、`vectorId`、`correlation_id`）。

## 🗄️ 数据库Schema

### Milvus集合结构
```javascript
{
  image_id: Int64 (主键，自增),
  file_path: VarChar(500) (文件路径),
  correlation_id: VarChar(100) (关联ID),
  image_embedding: FloatVector(768) (图片特征向量)
}
```

### 索引配置
- **索引类型**: HNSW
- **距离度量**: L2
- **参数**: M=16, efConstruction=200

## 🎨 前端组件说明

### ImageUpload.vue
图片上传组件，提供文件选择和上传功能。

**Props:**
- `uploading`: Boolean - 是否正在上传
- `uploadProgress`: Number - 上传进度 (0-100)

**Events:**
- `upload`: 上传事件，传递文件列表
- `error`: 错误事件，传递错误信息

### ImageSearch.vue
图片搜索组件，提供多种搜索方式。

**Props:**
- `searching`: Boolean - 是否正在搜索

**Events:**
- `search-upload`: 文件上传搜索事件
- `search-url`: URL搜索事件
- `search-blob`: Blob搜索事件
- `error`: 错误事件

### SearchResults.vue
搜索结果展示组件，显示搜索到的相似图片。

**Props:**
- `results`: Array - 搜索结果数组
- `loading`: Boolean - 是否正在加载

**Events:**
- `clear`: 清除搜索结果事件

## 🔧 配置说明

### 文件上传限制
- **单文件大小**: 最大10MB
- **总文件大小**: 最大50MB
- **支持格式**: jpg, jpeg, png, gif, webp
- **最大文件数**: 10个

### API配置
- **基础URL**: `http://localhost:3001`
- **超时设置**: 30秒
- **重试机制**: 自动重试失败请求

## 📱 响应式设计

### 断点设置
```css
/* 移动设备 */
@media (max-width: 480px) { ... }

/* 平板设备 */
@media (max-width: 768px) { ... }

/* 桌面设备 */
@media (min-width: 769px) { ... }
```

### 布局特性
- **弹性布局**: 使用Flexbox和Grid
- **自适应图片**: 图片自动缩放
- **触摸友好**: 移动设备触摸优化

## 🎨 样式系统

### 设计原则
- **现代简约**: 简洁的视觉设计
- **一致性**: 统一的颜色和字体
- **可访问性**: 良好的对比度和可读性

### 颜色方案
```css
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --text-color: #374151;
  --bg-color: #f9fafb;
}
```

### 动画效果
- **过渡动画**: 平滑的状态切换
- **加载动画**: 优雅的加载指示器
- **悬停效果**: 交互反馈动画

## 🚨 错误处理

### 错误码定义
```javascript
const NErrorCode = {
  Success: 0,
  InvalidParam: 1001,
  NotFound: 1002,
  InternalError: 1003,
  Unauthorized: 1004,
  Forbidden: 1005
};
```

### 统一响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": "错误信息",
  "code": 1001
}
```

## 🔍 调试和监控

### 健康检查
```http
GET /api/health
GET /api/health/collection
```

### 日志级别
- **INFO**: 正常操作日志
- **ERROR**: 错误信息
- **DEBUG**: 详细调试信息（开发环境）

## 📦 构建和部署

### 开发构建
```bash
# 前端开发
cd frontend
npm run dev

# 后端开发
cd backend
npm run dev
```

### 生产构建
```bash
# 前端构建
cd frontend
npm run build

# 后端启动
cd backend
npm start
```

### 构建输出
- **静态文件**: `frontend/dist/` 目录
- **资源优化**: 自动压缩和优化
- **代码分割**: 按需加载

## 🧪 测试

### 单元测试
```bash
# 前端测试
cd frontend
npm run test

# 后端测试
cd backend
npm run test
```

### 端到端测试
```bash
# 前端E2E测试
cd frontend
npm run test:e2e
```

## 🚀 部署指南

### Docker部署
```bash
# 构建镜像
docker build -t fashion-search-backend ./backend
docker build -t fashion-search-frontend ./frontend

# 运行容器
docker-compose up -d
```

### 生产环境配置
```bash
# 设置环境变量
export NODE_ENV=production
export PORT=3001
export MILVUS_HOST=your-milvus-host
```

## 🔧 故障排除

### 常见问题

#### 1. Milvus连接失败
```bash
# 检查Milvus服务状态
docker-compose ps

# 查看Milvus日志
docker-compose logs milvus
```

#### 2. 模型加载失败
```bash
# 清理模型缓存
rm -rf ./.cache

# 重新下载模型
npm run dev
```

#### 3. 文件上传失败
- 检查文件大小限制
- 确认文件格式支持
- 验证上传目录权限

### 性能调优

#### 后端优化
```javascript
// 调整搜索参数
const searchParams = {
  metric_type: 'L2',
  params: { nprobe: 20 }, // 增加搜索精度
  limit: 50 // 增加返回结果数量
};
```

#### 前端优化
```javascript
// 启用图片懒加载
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  // 实现懒加载逻辑
};
```

## 📊 监控和日志

### 应用监控
- **健康检查**: `/api/health`
- **集合状态**: `/api/health/collection`
- **系统信息**: `/api/health/system`

### 日志管理
```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

## 🔐 安全最佳实践

### 生产环境安全
1. **环境变量保护**: 使用 `.env` 文件管理敏感信息
2. **HTTPS配置**: 启用SSL/TLS加密
3. **访问控制**: 配置防火墙和访问限制
4. **定期更新**: 保持依赖包最新版本

### 数据安全
- 图片文件加密存储
- 向量数据访问控制
- 定期备份重要数据

## 📚 相关文档

- [API接口文档](./backend/API-文档.md) - 完整的API接口说明
- [环境配置说明](./backend/环境配置说明.md) - 详细的环境配置指南
- [服务端开发规范](./backend/服务端开发规范.md) - 后端开发规范
- [前端MVP架构说明](./frontend/MVP-架构说明.md) - 前端架构说明

## 🤝 社区支持

### 获取帮助
- 📧 **邮箱支持**: support@fashion-search.com
- 💬 **技术交流群**: 扫描二维码加入
- 📖 **文档中心**: https://docs.fashion-search.com

### 贡献代码
1. 查看 [贡献指南](#贡献指南)
2. 提交 Issue 描述问题
3. 创建 Pull Request
4. 参与代码审查

## 🙏 致谢

感谢以下开源项目和技术社区的支持：

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Express.js](https://expressjs.com/) - Node.js Web框架
- [Milvus](https://milvus.io/) - 向量数据库
- [@huggingface/transformers](https://huggingface.co/docs/transformers) - AI模型推理库
- [Marqo](https://marqo.ai/) - 向量搜索平台
- [Vite](https://vitejs.dev/) - 快速构建工具
- [Docker](https://www.docker.com/) - 容器化平台

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**⭐ 如果这个项目对您有帮助，请给我们一个Star！**