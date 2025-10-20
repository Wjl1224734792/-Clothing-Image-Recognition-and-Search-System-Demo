import path from 'path';

// 环境配置
export const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  
  // Milvus配置
  milvus: {
    host: process.env.MILVUS_HOST || 'localhost',
    port: process.env.MILVUS_PORT || '19530',
    ssl: process.env.MILVUS_SSL === 'true',
    // 超级管理员账号配置
    admin: {
      username: process.env.MILVUS_ADMIN_USER || 'root',
      password: process.env.MILVUS_ADMIN_PASSWORD || 'Milvus'
    }
  },
  
  // 文件上传配置
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedExtensions: (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,gif,webp').split(','),
    maxFiles: parseInt(process.env.MAX_FILES || '10')
  },

  // 临时文件配置
  temp: {
    dir: process.env.TEMP_DIR || './temp',
    maxAge: parseInt(process.env.TEMP_MAX_AGE || '3600000') // 1小时
  },
  
  // 模型配置
  model: {
    cacheDir: process.env.MODEL_CACHE_DIR || path.join(process.cwd(), '.cache'),
    name: process.env.MODEL_NAME || 'Marqo/marqo-fashionSigLIP',
    vectorDimension: parseInt(process.env.VECTOR_DIMENSION || '768')
  },
  
  // 向量数据库配置
  vector: {
    collectionName: process.env.COLLECTION_NAME || 'fashion_images',
    vectorDimension: parseInt(process.env.VECTOR_DIMENSION || '768'),
    indexType: process.env.INDEX_TYPE || 'HNSW',
    metricType: process.env.METRIC_TYPE || 'L2',
    indexParams: { 
      M: parseInt(process.env.HNSW_M || '16'), 
      efConstruction: parseInt(process.env.HNSW_EF_CONSTRUCTION || '200') 
    }
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    verbose: process.env.VERBOSE_LOGGING === 'true'
  },
  
  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  
  // 性能配置
  performance: {
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '10000'),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100')
  },
  
  // 开发配置
  development: {
    hotReload: process.env.HOT_RELOAD !== 'false',
    debugMode: process.env.DEBUG_MODE === 'true',
    enableApiDocs: process.env.ENABLE_API_DOCS !== 'false'
  }
};