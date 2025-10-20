import { ApiService } from './ApiService.js';
import { ImageModel } from '../models/ImageModel.js';
import { SearchResultModel } from '../models/SearchResultModel.js';

/**
 * 图片服务类
 * 处理图片相关的业务逻辑
 */
export class ImageService {
  constructor() {
    this.apiService = new ApiService();
  }

  /**
   * 上传图片文件
   * @param {FileList} files - 文件列表
   * @param {string} correlationId - 关联ID
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Array>} 上传结果
   */
  async uploadImages(files, correlationId = null, onProgress = null) {
    try {
      // 验证文件
      this.validateFiles(files);
      
      // 为每个文件生成UUID
      const filesWithUuid = Array.from(files).map(file => ({
        file: file,
        uuid: this.generateUUID()
      }));
      
      // 调用API上传，传递进度回调和UUID
      const response = await this.apiService.uploadImages(filesWithUuid, correlationId, onProgress);
      
      if (!response.success) {
        throw new Error(response.error || '上传失败');
      }

      // 转换为模型
      return response.data.map(result => ({
        filePath: result.filePath,
        vectorId: result.vectorId,
        correlationId: result.correlation_id,
        status: result.status,
        error: result.error
      }));
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  }

  /**
   * 通过字符串方式插入图片
   * @param {Object} imageData - 图片数据
   * @returns {Promise<Object>} 插入结果
   */
  async insertImage(imageData) {
    try {
      const response = await this.apiService.insertImage(imageData);
      
      if (!response.success) {
        throw new Error(response.error || '插入失败');
      }

      return {
        filePath: response.data.filePath,
        vectorId: response.data.vectorId,
        correlationId: response.data.correlation_id,
        status: response.data.status
      };
    } catch (error) {
      console.error('插入图片失败:', error);
      throw error;
    }
  }

  /**
   * 通过文件上传搜索图片
   * @param {File} file - 查询图片文件
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} 搜索结果
   */
  async searchByUpload(file, limit = 20) {
    try {
      // 验证文件
      this.validateSingleFile(file);
      
      // 调用API搜索
      const response = await this.apiService.searchByUpload(file, limit);
      
      if (!response.success) {
        throw new Error(response.error || '搜索失败');
      }

      // 转换为搜索结果模型
      return response.data.map((result, index) => 
        new SearchResultModel({
          id: result.id,
          filePath: result.filePath,
          score: result.score,
          similarity: result.similarity,
          correlationId: result.correlation_id,
          rank: index + 1
        })
      );
    } catch (error) {
      console.error('搜索图片失败:', error);
      throw error;
    }
  }

  /**
   * 通过字符串方式搜索图片
   * @param {Object} searchData - 搜索数据
   * @returns {Promise<Array>} 搜索结果
   */
  async searchByString(searchData) {
    try {
      // 验证搜索数据
      this.validateSearchData(searchData);
      
      // 调用API搜索
      const response = await this.apiService.searchByString(searchData);
      
      if (!response.success) {
        throw new Error(response.error || '搜索失败');
      }

      // 转换为搜索结果模型
      return response.data.map((result, index) => 
        new SearchResultModel({
          id: result.id,
          filePath: result.filePath,
          score: result.score,
          similarity: result.similarity,
          correlationId: result.correlation_id,
          rank: index + 1
        })
      );
    } catch (error) {
      console.error('搜索图片失败:', error);
      throw error;
    }
  }

  /**
   * 通过Blob方式插入图片
   * @param {Object} imageData - 图片数据
   * @returns {Promise<Object>} 插入结果
   */
  async insertImageFromBlob(imageData) {
    try {
      // 验证Blob数据
      this.validateBlobData(imageData);
      
      // 调用API插入
      const response = await this.apiService.insertImageFromBlob(imageData);
      
      if (!response.success) {
        throw new Error(response.error || '插入失败');
      }

      return {
        filePath: response.data.filePath,
        vectorId: response.data.vectorId,
        correlationId: response.data.correlation_id,
        status: response.data.status
      };
    } catch (error) {
      console.error('插入图片Blob失败:', error);
      throw error;
    }
  }

  /**
   * 通过Blob方式搜索图片
   * @param {Object} searchData - 搜索数据
   * @returns {Promise<Array>} 搜索结果
   */
  async searchByBlob(searchData) {
    try {
      // 验证Blob搜索数据
      this.validateBlobSearchData(searchData);
      
      // 调用API搜索
      const response = await this.apiService.searchByBlob(searchData);
      
      if (!response.success) {
        throw new Error(response.error || '搜索失败');
      }

      // 转换为搜索结果模型
      return response.data.map((result, index) => 
        new SearchResultModel({
          id: result.id,
          filePath: result.filePath,
          score: result.score,
          similarity: result.similarity,
          correlationId: result.correlation_id,
          rank: index + 1
        })
      );
    } catch (error) {
      console.error('搜索图片Blob失败:', error);
      throw error;
    }
  }


  /**
   * 验证文件列表
   * @param {FileList} files - 文件列表
   * @throws {Error} 验证失败时抛出错误
   */
  validateFiles(files) {
    if (!files || files.length === 0) {
      throw new Error('请选择要上传的图片文件');
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxTotalSize = 50 * 1024 * 1024; // 50MB
    let totalSize = 0;

    Array.from(files).forEach((file, index) => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error(`文件 ${file.name} 不是有效的图片格式`);
      }

      // 检查单个文件大小
      if (file.size > maxFileSize) {
        throw new Error(`文件 ${file.name} 大小超过10MB限制`);
      }

      totalSize += file.size;
    });

    // 检查总大小
    if (totalSize > maxTotalSize) {
      throw new Error(`总文件大小超过50MB限制，当前大小: ${this.formatFileSize(totalSize)}`);
    }
  }

  /**
   * 验证单个文件
   * @param {File} file - 文件
   * @throws {Error} 验证失败时抛出错误
   */
  validateSingleFile(file) {
    if (!file) {
      throw new Error('请选择要搜索的图片文件');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('请选择有效的图片文件');
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      throw new Error('图片文件大小不能超过10MB');
    }
  }

  /**
   * 验证搜索数据
   * @param {Object} searchData - 搜索数据
   * @throws {Error} 验证失败时抛出错误
   */
  validateSearchData(searchData) {
    if (!searchData.image_path && !searchData.image_data && !searchData.image_url) {
      throw new Error('请提供图片路径、图片数据或图片URL');
    }
  }

  /**
   * 验证Blob数据
   * @param {Object} imageData - 图片数据
   * @throws {Error} 验证失败时抛出错误
   */
  validateBlobData(imageData) {
    if (!imageData.image_blob && !imageData.image_url) {
      throw new Error('请提供图片Blob数据或图片URL');
    }
  }

  /**
   * 验证Blob搜索数据
   * @param {Object} searchData - 搜索数据
   * @throws {Error} 验证失败时抛出错误
   */
  validateBlobSearchData(searchData) {
    if (!searchData.image_blob && !searchData.image_url) {
      throw new Error('请提供图片Blob数据或图片URL');
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化的文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
  }

  /**
   * 将文件转换为二进制数据
   * @param {File} file - 文件
   * @returns {Promise<string>} 二进制数据
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 通过Blob方式更新嵌入数据
   * @param {string} correlationId - 关联ID
   * @param {Object} imageData - 图片数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateEmbeddingByBlob(correlationId, imageData) {
    try {
      // 验证Blob数据
      this.validateBlobData(imageData);
      
      // 调用API更新
      const response = await this.apiService.updateEmbeddingByBlob(correlationId, imageData);
      
      if (!response.success) {
        throw new Error(response.error || '更新失败');
      }

      return {
        success: response.data.success,
        correlationId: response.data.correlationId,
        filePath: response.data.filePath,
        updatedRecords: response.data.updatedRecords,
        upsertedCount: response.data.upsertedCount
      };
    } catch (error) {
      console.error('更新嵌入数据Blob失败:', error);
      throw error;
    }
  }

  /**
   * 生成UUID
   * @returns {string} UUID字符串
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 将文件转换为Blob数据
   * @param {File} file - 文件
   * @returns {Promise<string>} Blob数据
   */
  async fileToBlob(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

}
