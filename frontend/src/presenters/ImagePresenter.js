import { ImageService } from '../services/ImageService.js';
import { ImageModel } from '../models/ImageModel.js';
import { SearchResultModel } from '../models/SearchResultModel.js';

/**
 * 图片展示器
 * 处理图片相关的业务逻辑和状态管理
 */
export class ImagePresenter {
  constructor(view) {
    this.view = view;
    this.imageService = new ImageService();
    
    // 状态管理
    this.state = {
      searchResults: [],
      loading: false,
      error: null,
      uploadProgress: 0
    };
  }

  /**
   * 初始化展示器
   */
  async initialize() {
    try {
      console.log('✅ 图片展示器初始化完成');
    } catch (error) {
      this.handleError('初始化失败', error);
    }
  }

  /**
   * 上传图片
   * @param {FileList} files - 文件列表
   * @param {string} correlationId - 关联ID
   */
  async uploadImages(files, correlationId = null) {
    try {
      this.setLoading(true);
      this.setError(null);
      this.setUploadProgress(0);

      // 如果没有提供correlation_id，自动生成一个
      if (!correlationId) {
        correlationId = this.generateCorrelationId();
        console.log('🔗 自动生成correlation_id:', correlationId);
      }

      // 定义进度回调函数
      const onProgress = (progress) => {
        this.setUploadProgress(progress);
      };

      // 调用上传服务，传递进度回调
      const results = await this.imageService.uploadImages(files, correlationId, onProgress);

      // 处理上传结果
      const successfulUploads = results.filter(result => result.status === 'success');
      const failedUploads = results.filter(result => result.status === 'failed');

      if (successfulUploads.length > 0) {
        this.view.showSuccess(`成功上传 ${successfulUploads.length} 张图片`);
      }

      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(result => result.error).join(', ');
        this.view.showWarning(`${failedUploads.length} 张图片上传失败: ${errorMessages}`);
      }

    } catch (error) {
      this.handleError('上传图片失败', error);
    } finally {
      this.setLoading(false);
      // 延迟重置进度条，让用户看到100%完成状态
      setTimeout(() => {
        this.setUploadProgress(0);
      }, 1000);
    }
  }

  /**
   * 通过文件上传搜索图片
   * @param {File} file - 查询图片文件
   * @param {number} limit - 返回结果数量限制
   */
  async searchByUpload(file, limit = 20) {
    try {
      this.setLoading(true);
      this.setError(null);

      const results = await this.imageService.searchByUpload(file, limit);
      this.setSearchResults(results);

      if (results.length > 0) {
        this.view.showSuccess(`找到 ${results.length} 个相似图片`);
      } else {
        this.view.showInfo('未找到相似图片');
      }

    } catch (error) {
      this.handleError('搜索图片失败', error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 通过URL搜索图片
   * @param {string} imageUrl - 图片URL
   * @param {number} limit - 返回结果数量限制
   */
  async searchByUrl(imageUrl, limit = 20) {
    try {
      this.setLoading(true);
      this.setError(null);

      const searchData = {
        image_url: imageUrl,
        limit: limit
      };

      const results = await this.imageService.searchByString(searchData);
      this.setSearchResults(results);

      if (results.length > 0) {
        this.view.showSuccess(`找到 ${results.length} 个相似图片`);
      } else {
        this.view.showInfo('未找到相似图片');
      }

    } catch (error) {
      this.handleError('搜索图片失败', error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 通过Blob数据搜索图片
   * @param {string} blobData - 图片Blob数据
   * @param {number} limit - 返回结果数量限制
   */
  async searchByBlob(blobData, limit = 20) {
    try {
      this.setLoading(true);
      this.setError(null);

      const searchData = {
        image_blob: blobData,
        limit: limit
      };

      const results = await this.imageService.searchByBlob(searchData);
      this.setSearchResults(results);

      if (results.length > 0) {
        this.view.showSuccess(`找到 ${results.length} 个相似图片`);
      } else {
        this.view.showInfo('未找到相似图片');
      }

    } catch (error) {
      this.handleError('搜索图片失败', error);
    } finally {
      this.setLoading(false);
    }
  }



  /**
   * 通过Blob方式更新嵌入数据
   * @param {string} correlationId - 关联ID
   * @param {Object} imageData - 图片数据
   */
  async updateEmbeddingByBlob(correlationId, imageData) {
    try {
      this.setLoading(true);
      this.setError(null);

      const result = await this.imageService.updateEmbeddingByBlob(correlationId, imageData);
      
      if (result.success) {
        this.view.showSuccess(`成功更新correlation_id为${correlationId}的嵌入数据`);
      } else {
        this.view.showError('更新嵌入数据失败');
      }

    } catch (error) {
      this.handleError('更新嵌入数据失败', error);
    } finally {
      this.setLoading(false);
    }
  }


  /**
   * 清空搜索结果
   */
  clearSearchResults() {
    this.setSearchResults([]);
  }

  /**
   * 处理错误
   * @param {string} message - 错误消息
   * @param {Error} error - 错误对象
   */
  handleError(message, error) {
    console.error(message, error);
    this.setError(error.message || message);
    this.view.showError(error.message || message);
  }

  // 状态更新方法
  setLoading(loading) {
    this.state.loading = loading;
    this.view.updateLoading(loading);
  }

  setError(error) {
    this.state.error = error;
    this.view.updateError(error);
  }

  setSearchResults(results) {
    this.state.searchResults = results;
    this.view.updateSearchResults(results);
  }

  setUploadProgress(progress) {
    this.state.uploadProgress = progress;
    this.view.updateUploadProgress(progress);
  }

  // 获取状态
  getState() {
    return { ...this.state };
  }

  /**
   * 生成correlation_id
   * 使用crypto.randomUUID()生成唯一标识符
   * @returns {string} 生成的correlation_id
   */
  generateCorrelationId() {
    try {
      // 使用crypto.randomUUID()生成UUID
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      
      // 降级方案：使用时间戳 + 随机数
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `upload_${timestamp}_${random}`;
    } catch (error) {
      console.warn('生成UUID失败，使用降级方案:', error);
      // 最终降级方案
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `upload_${timestamp}_${random}`;
    }
  }
}
