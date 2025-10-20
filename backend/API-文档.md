# 👗 服装图片识别与搜索API文档

## 📋 概述

基于MVC架构的服装图片识别与搜索服务，支持向量数据库的插入和搜索功能，专门针对服装图片进行优化。

### 🏗️ 架构设计

```
Controller → Service → Repository → Model
     ↓
Middleware → Validator → Utils
```

### 🗄️ 数据库Schema

```sql
fashion_images:
├── image_id (自增主键)
├── file_path (文件路径)
├── correlation_id (关联ID)
└── image_embedding (768维向量)
```

## 🚀 快速开始

### 启动服务

```bash
# 启动MVC架构服务
npm run dev:mvc

# 或使用批处理文件
start-backend-mvc.bat
```

### 服务地址

- 基础URL: `http://localhost:3001`
- 健康检查: `http://localhost:3001/api/health`

## 📡 API接口

### 1. 图片上传插入 (文件方式)

**POST** `/api/images/upload`

**请求参数:**
- `images`: 图片文件数组 (multipart/form-data)
- `correlation_id`: 关联ID (可选)

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "filePath": "uploads/1760610844072_eriqi1.jpg",
      "vectorId": [123456],
      "correlation_id": "user_001",
      "status": "success"
    }
  ],
  "message": "图片上传并插入向量数据库成功"
}
```

### 2. 图片插入 (字符串方式)

**POST** `/api/images/insert`

**请求参数:**
```json
{
  "image_path": "uploads/image.jpg",  // 文件路径
  "image_data": "data:image/jpeg;base64,...",  // 二进制数据
  "image_url": "https://example.com/image.jpg",  // 图片URL
  "correlation_id": "user_001"  // 关联ID
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "filePath": "uploads/image.jpg",
    "vectorId": [123456],
    "correlation_id": "user_001",
    "status": "success"
  },
  "message": "图片插入向量数据库成功"
}
```

### 3. 图片搜索 (文件上传方式)

**POST** `/api/images/search/upload`

**请求参数:**
- `image`: 查询图片文件 (multipart/form-data)
- `limit`: 返回结果数量 (可选，默认20)

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "filePath": "uploads/similar_image.jpg",
      "score": 0.1234,
      "id": "123456",
      "correlation_id": "user_001",
      "similarity": 87.66
    }
  ],
  "message": "图片搜索完成"
}
```

### 4. 图片搜索 (字符串方式)

**POST** `/api/images/search`

**请求参数:**
```json
{
  "image_path": "uploads/query.jpg",  // 查询图片路径
  "image_data": "data:image/jpeg;base64,...",  // 查询图片数据
  "image_url": "https://example.com/query.jpg",  // 查询图片URL
  "limit": 20  // 返回结果数量
}
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "filePath": "uploads/similar_image.jpg",
      "score": 0.1234,
      "id": "123456",
      "correlation_id": "user_001",
      "similarity": 87.66
    }
  ],
  "message": "图片搜索完成"
}
```

### 5. 根据correlation_id删除图片

**DELETE** `/api/images/correlation/:correlationId`

**响应示例:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "deletedCount": 3,
    "correlationId": "user_001"
  },
  "message": "成功删除correlation_id为user_001的图片"
}
```

### 6. 根据correlation_id查询图片

**GET** `/api/images/correlation/:correlationId`

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "image_id": "123456",
      "file_path": "uploads/image1.jpg",
      "correlation_id": "user_001"
    },
    {
      "image_id": "123457", 
      "file_path": "uploads/image2.jpg",
      "correlation_id": "user_001"
    }
  ],
  "message": "成功获取correlation_id为user_001的图片"
}
```


### 7. 通过文件上传方式更新correlation_id的嵌入数据

**POST** `/api/images/correlation/:correlationId/update/upload`

**请求参数:**
- `images`: File[] (图片文件数组)
- `correlation_id`: string (关联ID，从URL路径获取)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "correlationId": "user_001",
    "totalFiles": 2,
    "updatedRecords": 2,
    "upsertedCount": 2,
    "updateResult": {
      "success": true,
      "upsertedCount": 2,
      "insertedCount": 0,
      "deletedCount": 0,
      "correlationId": "user_001",
      "updatedRecords": 2
    }
  },
  "message": "成功更新correlation_id为user_001的嵌入数据"
}
```

### 8. 通过字符串方式更新correlation_id的嵌入数据

**POST** `/api/images/correlation/:correlationId/update/string`

**请求参数:**
```json
{
  "image_path": "uploads/image.jpg",  // 图片文件路径
  "image_data": "data:image/jpeg;base64,...",  // 图片数据
  "image_url": "https://example.com/image.jpg"  // 图片URL
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "correlationId": "user_001",
    "filePath": "uploads/1234567890_image.jpg",
    "updatedRecords": 1,
    "upsertedCount": 1,
    "updateResult": {
      "success": true,
      "upsertedCount": 1,
      "insertedCount": 0,
      "deletedCount": 0,
      "correlationId": "user_001",
      "updatedRecords": 1
    }
  },
  "message": "成功更新correlation_id为user_001的嵌入数据"
}
```

## 🔧 健康检查

### 基础健康检查

**GET** `/api/health`

### 数据库连接检查

**GET** `/api/health/database`

### 集合状态检查

**GET** `/api/health/collection`

### 系统信息检查

**GET** `/api/health/system`

## 🛠️ 技术栈

- **框架**: Express.js
- **架构**: MVC (Model-View-Controller)
- **向量数据库**: Milvus
- **AI模型**: Marqo/marqo-fashionSigLIP (768维)
- **特征提取**: HuggingFace Transformers.js 管道API
- **文件处理**: Multer
- **语言**: JavaScript (ES6+)

## 📊 配置说明

### 环境变量

```bash
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
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

# 模型配置
MODEL_CACHE_DIR=./.cache
MODEL_NAME=Marqo/marqo-fashionSigLIP
```

### 向量数据库配置

- **集合名称**: `fashion_images`
- **向量维度**: 768
- **索引类型**: HNSW
- **距离度量**: L2
- **索引参数**: M=16, efConstruction=200

## 🚨 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误描述",
  "code": 400,
  "details": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 常见错误码

- `400`: 请求参数错误
- `404`: 资源不存在
- `422`: 数据验证失败
- `500`: 服务器内部错误
- `1001`: 数据库操作失败
- `1005`: 向量维度不匹配
- `1007`: 嵌入向量生成失败

## 📝 使用示例

### JavaScript (前端)

```javascript
// 上传图片搜索
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/images/search/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('搜索结果:', result.data);
```

### cURL

```bash
# 上传图片搜索
curl -X POST http://localhost:3001/api/images/search/upload \
  -F "image=@query.jpg" \
  -F "limit=5"

# 字符串方式搜索
curl -X POST http://localhost:3001/api/images/search \
  -H "Content-Type: application/json" \
  -d '{"image_path": "uploads/query.jpg", "limit": 5}'
```

## 🎯 最佳实践

1. **文件上传**: 建议使用multipart/form-data格式
2. **图片格式**: 支持jpg, jpeg, png, gif, webp
3. **文件大小**: 建议不超过10MB
4. **批量操作**: 使用correlation_id进行关联
5. **错误处理**: 始终检查响应中的success字段
6. **性能优化**: 合理设置limit参数控制返回结果数量
