import { Router } from 'express';
import { buildSuccessResponse } from '../utils/response-utils.js';
import { ImagesRepository } from '../repositories/images-repository.js';
import { asyncHandler } from '../middlewares/error-middleware.js';

/**
 * 健康检查路由
 * 提供系统状态检查相关的API
 */
const router = Router();
const imagesRepository = new ImagesRepository();

/**
 * 基础健康检查
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.json(buildSuccessResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'image-search-backend',
    version: '1.0.0'
  }, '服务运行正常'));
});

/**
 * 数据库连接检查
 * GET /api/health/database
 */
router.get('/database', asyncHandler(async (req, res) => {
  try {
    const collectionStatus = await imagesRepository.checkCollectionStatus();
    
    res.json(buildSuccessResponse({
      database: 'Milvus',
      collection: {
        name: 'fashion_images',
        exists: collectionStatus.exists,
        loaded: collectionStatus.loaded
      },
      status: collectionStatus.exists && collectionStatus.loaded ? 'healthy' : 'unhealthy'
    }, '数据库连接检查完成'));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '数据库连接失败',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 集合状态检查
 * GET /api/health/collection
 */
router.get('/collection', asyncHandler(async (req, res) => {
  try {
    console.log('🔍 检查集合状态...');
    
    // 查询集合中的记录数量
    const queryResult = await imagesRepository.milvusClient.query({
      collection_name: 'fashion_images',
      filter: '',
      output_fields: ['image_id'],
      limit: 5
    });
    
    res.json(buildSuccessResponse({
      collectionName: 'fashion_images',
      recordCount: queryResult.total || 0,
      sampleRecords: queryResult.data || [],
      status: 'loaded'
    }, `集合中有 ${queryResult.total || 0} 条记录`));
  } catch (error) {
    console.error('❌ 检查集合状态失败:', error);
    res.status(500).json({
      success: false,
      error: '集合状态检查失败',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * 系统信息检查
 * GET /api/health/system
 */
router.get('/system', (req, res) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
      external: process.memoryUsage().external
    },
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(buildSuccessResponse(systemInfo, '系统信息获取成功'));
});

export default router;
