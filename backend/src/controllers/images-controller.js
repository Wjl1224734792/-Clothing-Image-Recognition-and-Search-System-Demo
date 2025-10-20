import { ImagesService } from '../services/images-service.js';
import { buildSuccessResponse, buildErrorResponse } from '../utils/response-utils.js';
import { NErrorCode } from '../enums/error-enums.js';

/**
 * 图片控制器
 * 处理图片相关的HTTP请求
 */
export class ImagesController {
  constructor() {
    this.imagesService = new ImagesService();
    this.isInitialized = false;
  }

  /**
   * 初始化控制器
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔧 初始化图片控制器...');
      
      // 初始化服务
      await this.imagesService.initialize();
      
      this.isInitialized = true;
      console.log('✅ 图片控制器初始化完成');
    } catch (error) {
      console.error('❌ 图片控制器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 上传文件方式插入向量数据库
   * POST /api/images/upload
   */
  async uploadImages(req, res) {
    try {
      const files = req.files;
      const { correlation_id, uuids } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json(
          buildErrorResponse('请选择要上传的图片文件', NErrorCode.ValidationError)
        );
      }

      // 解析UUID数组
      const uuidsArray = uuids ? (Array.isArray(uuids) ? uuids : uuids.split(',')) : [];
      
      const results = await this.imagesService.insertImagesFromFiles(files, correlation_id, uuidsArray);
      
      res.json(buildSuccessResponse(results, '图片上传并插入向量数据库成功'));
    } catch (error) {
      console.error('❌ 上传图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`上传图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * 字符串方式插入向量数据库
   * POST /api/images/insert
   */
  async insertImage(req, res) {
    try {
      const { image_path, image_data, image_url, correlation_id } = req.body;

      if (!image_path && !image_data && !image_url) {
        return res.status(400).json(
          buildErrorResponse('请提供图片路径、图片数据或图片URL', NErrorCode.ValidationError)
        );
      }

      const result = await this.imagesService.insertImageFromString({
        image_path,
        image_data,
        image_url,
        correlation_id
      });

      res.json(buildSuccessResponse(result, '图片插入向量数据库成功'));
    } catch (error) {
      console.error('❌ 插入图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`插入图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * 批量插入图片到向量数据库（通过文件路径）
   * POST /api/images/batch-insert
   */
  async batchInsertByPaths(req, res) {
    try {
      const { image_paths, correlation_id, batch_name } = req.body;
      
      if (!image_paths || !Array.isArray(image_paths) || image_paths.length === 0) {
        return res.status(400).json(
          buildErrorResponse('请提供图片路径数组', NErrorCode.ValidationError)
        );
      }

      // 验证路径格式
      const invalidPaths = image_paths.filter(path => typeof path !== 'string' || path.trim() === '');
      if (invalidPaths.length > 0) {
        return res.status(400).json(
          buildErrorResponse('图片路径必须是有效的字符串', NErrorCode.ValidationError)
        );
      }

      const results = await this.imagesService.batchInsertImagesFromPaths(
        image_paths, 
        correlation_id, 
        batch_name
      );
      
      const successCount = results.filter(r => r.status === 'success').length;
      const failCount = results.length - successCount;
      
      res.json(buildSuccessResponse(results, `批量插入完成！成功: ${successCount}, 失败: ${failCount}`));
    } catch (error) {
      console.error('❌ 批量插入图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`批量插入图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * Blob方式插入向量数据库
   * POST /api/images/insert/blob
   */
  async insertImageFromBlob(req, res) {
    try {
      const { image_blob, image_url, correlation_id } = req.body;

      if (!image_blob && !image_url) {
        return res.status(400).json(
          buildErrorResponse('请提供图片Blob数据或图片URL', NErrorCode.ValidationError)
        );
      }

      const result = await this.imagesService.insertImageFromBlob({
        image_blob,
        image_url,
        correlation_id
      });

      res.json(buildSuccessResponse(result, '图片Blob插入向量数据库成功'));
    } catch (error) {
      console.error('❌ 插入图片Blob失败:', error);
      res.status(500).json(
        buildErrorResponse(`插入图片Blob失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * 上传文件方式搜索向量数据库
   * POST /api/images/search/upload
   */
  async searchByUpload(req, res) {
    try {
      const file = req.file;
      const { limit = 20 } = req.body;

      if (!file) {
        return res.status(400).json(
          buildErrorResponse('请上传要搜索的图片文件', NErrorCode.ValidationError)
        );
      }

      const results = await this.imagesService.searchImagesFromFile(file, limit);
      
      res.json(buildSuccessResponse(results, '图片搜索完成'));
    } catch (error) {
      console.error('❌ 搜索图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`搜索图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * 字符串方式搜索向量数据库
   * POST /api/images/search
   */
  async searchByString(req, res) {
    try {
      const { image_path, image_data, image_url, limit = 20 } = req.body;

      if (!image_path && !image_data && !image_url) {
        return res.status(400).json(
          buildErrorResponse('请提供图片路径、图片数据或图片URL', NErrorCode.ValidationError)
        );
      }

      const results = await this.imagesService.searchImagesFromString({
        image_path,
        image_data,
        image_url,
        limit
      });

      res.json(buildSuccessResponse(results, '图片搜索完成'));
    } catch (error) {
      console.error('❌ 搜索图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`搜索图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * Blob方式搜索向量数据库
   * POST /api/images/search/blob
   */
  async searchByBlob(req, res) {
    try {
      const { image_blob, image_url, limit = 20 } = req.body;

      if (!image_blob && !image_url) {
        return res.status(400).json(
          buildErrorResponse('请提供图片Blob数据或图片URL', NErrorCode.ValidationError)
        );
      }

      const results = await this.imagesService.searchImagesFromBlob({
        image_blob,
        image_url,
        limit
      });

      res.json(buildSuccessResponse(results, '图片Blob搜索完成'));
    } catch (error) {
      console.error('❌ 搜索图片Blob失败:', error);
      res.status(500).json(
        buildErrorResponse(`搜索图片Blob失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }


  /**
   * 根据correlation_id删除图片
   * DELETE /api/images/correlation/:correlationId
   */
  async deleteImagesByCorrelationId(req, res) {
    try {
      const { correlationId } = req.params;
      const result = await this.imagesService.deleteImagesByCorrelationId(correlationId);
      
      res.json(buildSuccessResponse(result, `成功删除correlation_id为${correlationId}的图片`));
    } catch (error) {
      console.error('❌ 根据correlation_id删除图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`根据correlation_id删除图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }


  /**
   * 根据correlation_id查询图片
   * GET /api/images/correlation/:correlationId
   */
  async getImagesByCorrelationId(req, res) {
    try {
      const { correlationId } = req.params;
      const result = await this.imagesService.getImagesByCorrelationId(correlationId);
      
      res.json(buildSuccessResponse(result, `成功获取correlation_id为${correlationId}的图片`));
    } catch (error) {
      console.error('❌ 根据correlation_id查询图片失败:', error);
      res.status(500).json(
        buildErrorResponse(`根据correlation_id查询图片失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }


  /**
   * 通过文件上传方式更新correlation_id的嵌入数据
   * POST /api/images/correlation/:correlationId/update/upload
   */
  async updateEmbeddingByUpload(req, res) {
    try {
      const { correlationId } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json(
          buildErrorResponse('请选择要更新的图片文件', NErrorCode.ValidationError)
        );
      }

      const result = await this.imagesService.updateImagesEmbeddingFromFiles(files, correlationId);
      
      res.json(buildSuccessResponse(result, `成功更新correlation_id为${correlationId}的嵌入数据`));
    } catch (error) {
      console.error('❌ 通过文件上传方式更新嵌入数据失败:', error);
      res.status(500).json(
        buildErrorResponse(`通过文件上传方式更新嵌入数据失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * 通过字符串方式更新correlation_id的嵌入数据
   * POST /api/images/correlation/:correlationId/update/string
   */
  async updateEmbeddingByString(req, res) {
    try {
      const { correlationId } = req.params;
      const { image_path, image_data, image_url } = req.body;

      if (!image_path && !image_data && !image_url) {
        return res.status(400).json(
          buildErrorResponse('请提供图片路径、图片数据或图片URL', NErrorCode.ValidationError)
        );
      }

      const result = await this.imagesService.updateImagesEmbeddingFromString(
        { image_path, image_data, image_url }, 
        correlationId
      );
      
      res.json(buildSuccessResponse(result, `成功更新correlation_id为${correlationId}的嵌入数据`));
    } catch (error) {
      console.error('❌ 通过字符串方式更新嵌入数据失败:', error);
      res.status(500).json(
        buildErrorResponse(`通过字符串方式更新嵌入数据失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }

  /**
   * 通过Blob方式更新correlation_id的嵌入数据
   * POST /api/images/correlation/:correlationId/update/blob
   */
  async updateEmbeddingByBlob(req, res) {
    try {
      const { correlationId } = req.params;
      const { image_blob, image_url } = req.body;

      if (!image_blob && !image_url) {
        return res.status(400).json(
          buildErrorResponse('请提供图片Blob数据或图片URL', NErrorCode.ValidationError)
        );
      }

      const result = await this.imagesService.updateImagesEmbeddingFromBlob(
        { image_blob, image_url }, 
        correlationId
      );
      
      res.json(buildSuccessResponse(result, `成功更新correlation_id为${correlationId}的嵌入数据`));
    } catch (error) {
      console.error('❌ 通过Blob方式更新嵌入数据失败:', error);
      res.status(500).json(
        buildErrorResponse(`通过Blob方式更新嵌入数据失败: ${error.message}`, NErrorCode.InternalError)
      );
    }
  }
}
