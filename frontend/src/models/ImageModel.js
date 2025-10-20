/**
 * 图片模型
 * 定义图片实体的数据结构和验证规则
 */
export class ImageModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.filePath = data.filePath || '';
    this.correlationId = data.correlationId || null;
    this.uploadTime = data.uploadTime || new Date();
    this.fileSize = data.fileSize || 0;
    this.fileName = data.fileName || '';
    this.status = data.status || 'pending';
    this.embedding = data.embedding || null;
    
    // 验证必需字段
    this.validate();
  }

  /**
   * 验证模型数据
   * @throws {Error} 验证失败时抛出错误
   */
  validate() {
    if (!this.filePath && !this.fileName) {
      throw new Error('图片路径或文件名不能为空');
    }

    if (this.fileSize < 0) {
      throw new Error('文件大小不能为负数');
    }

    if (this.fileSize > 10 * 1024 * 1024) { // 10MB
      throw new Error('单张图片大小不能超过10MB');
    }
  }

  /**
   * 转换为API请求格式
   * @returns {Object} API请求格式
   */
  toApiFormat() {
    return {
      file_path: this.filePath,
      correlation_id: this.correlationId,
      file_size: this.fileSize,
      file_name: this.fileName
    };
  }

  /**
   * 从API响应创建模型
   * @param {Object} apiResponse - API响应数据
   * @returns {ImageModel} 图片模型实例
   */
  static fromApiResponse(apiResponse) {
    return new ImageModel({
      id: apiResponse.id,
      filePath: apiResponse.filePath,
      correlationId: apiResponse.correlation_id,
      uploadTime: new Date(apiResponse.uploadTime),
      fileSize: apiResponse.fileSize,
      fileName: apiResponse.fileName,
      status: apiResponse.status
    });
  }

  /**
   * 获取文件大小格式化显示
   * @returns {string} 格式化的文件大小
   */
  getFormattedFileSize() {
    if (this.fileSize === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(this.fileSize) / Math.log(k));
    
    return parseFloat((this.fileSize / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
  }

  /**
   * 获取图片URL
   * @param {string} baseUrl - 基础URL
   * @returns {string} 完整的图片URL
   */
  getImageUrl(baseUrl = '') {
    if (this.filePath.startsWith('http')) {
      return this.filePath;
    }
    return `${baseUrl}/${this.filePath}`;
  }

  /**
   * 检查是否为有效模型
   * @returns {boolean} 是否有效
   */
  isValid() {
    try {
      this.validate();
      return true;
    } catch (error) {
      return false;
    }
  }
}
