import { Router } from 'express';
import { ImagesController } from '../controllers/images-controller.js';
import { uploadSingle, uploadMultiple, uploadErrorHandler, validateUploadedFiles } from '../middlewares/upload-middleware.js';
import { asyncHandler } from '../middlewares/error-middleware.js';

/**
 * 图片路由
 * 定义图片相关的API路由
 */
const router = Router();
const imagesController = new ImagesController();

/**
 * 上传文件方式插入向量数据库
 * POST /api/images/upload
 */
router.post('/upload', 
  uploadMultiple, 
  uploadErrorHandler, 
  validateUploadedFiles,
  asyncHandler(imagesController.uploadImages.bind(imagesController))
);

/**
 * 字符串方式插入向量数据库
 * POST /api/images/insert
 */
router.post('/insert',
  asyncHandler(imagesController.insertImage.bind(imagesController))
);

/**
 * 批量插入图片到向量数据库（通过文件路径）
 * POST /api/images/batch-insert
 */
router.post('/batch-insert',
  asyncHandler(imagesController.batchInsertByPaths.bind(imagesController))
);

/**
 * Blob方式插入向量数据库
 * POST /api/images/insert/blob
 */
router.post('/insert/blob',
  asyncHandler(imagesController.insertImageFromBlob.bind(imagesController))
);

/**
 * 上传文件方式搜索向量数据库
 * POST /api/images/search/upload
 */
router.post('/search/upload',
  uploadSingle,
  uploadErrorHandler,
  validateUploadedFiles,
  asyncHandler(imagesController.searchByUpload.bind(imagesController))
);

/**
 * 字符串方式搜索向量数据库
 * POST /api/images/search
 */
router.post('/search',
  asyncHandler(imagesController.searchByString.bind(imagesController))
);

/**
 * Blob方式搜索向量数据库
 * POST /api/images/search/blob
 */
router.post('/search/blob',
  asyncHandler(imagesController.searchByBlob.bind(imagesController))
);


/**
 * 根据correlation_id删除图片
 * DELETE /api/images/correlation/:correlationId
 */
router.delete('/correlation/:correlationId',
  asyncHandler(imagesController.deleteImagesByCorrelationId.bind(imagesController))
);


/**
 * 根据correlation_id查询图片
 * GET /api/images/correlation/:correlationId
 */
router.get('/correlation/:correlationId',
  asyncHandler(imagesController.getImagesByCorrelationId.bind(imagesController))
);


/**
 * 通过文件上传方式更新correlation_id的嵌入数据
 * POST /api/images/correlation/:correlationId/update/upload
 */
router.post('/correlation/:correlationId/update/upload',
  uploadMultiple,
  uploadErrorHandler,
  validateUploadedFiles,
  asyncHandler(imagesController.updateEmbeddingByUpload.bind(imagesController))
);

/**
 * 通过字符串方式更新correlation_id的嵌入数据
 * POST /api/images/correlation/:correlationId/update/string
 */
router.post('/correlation/:correlationId/update/string',
  asyncHandler(imagesController.updateEmbeddingByString.bind(imagesController))
);

/**
 * 通过Blob方式更新correlation_id的嵌入数据
 * POST /api/images/correlation/:correlationId/update/blob
 */
router.post('/correlation/:correlationId/update/blob',
  asyncHandler(imagesController.updateEmbeddingByBlob.bind(imagesController))
);

export default router;
