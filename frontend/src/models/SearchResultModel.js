/**
 * 搜索结果模型
 * 定义搜索结果的数据结构
 */
export class SearchResultModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.filePath = data.filePath || '';
    this.score = data.score || 0;
    this.similarity = data.similarity || 0;
    this.correlationId = data.correlationId || null;
    this.rank = data.rank || 0;
    
    // 验证必需字段
    this.validate();
  }

  /**
   * 验证模型数据
   * @throws {Error} 验证失败时抛出错误
   */
  validate() {
    if (!this.filePath) {
      throw new Error('搜索结果文件路径不能为空');
    }

    if (this.score < 0 || this.score > 1) {
      throw new Error('相似度分数必须在0-1之间');
    }

    if (this.similarity < 0 || this.similarity > 100) {
      throw new Error('相似度百分比必须在0-100之间');
    }
  }

  /**
   * 从API响应创建模型
   * @param {Object} apiResponse - API响应数据
   * @returns {SearchResultModel} 搜索结果模型实例
   */
  static fromApiResponse(apiResponse) {
    return new SearchResultModel({
      id: apiResponse.id,
      filePath: apiResponse.filePath,
      score: apiResponse.score,
      similarity: apiResponse.similarity,
      correlationId: apiResponse.correlation_id,
      rank: apiResponse.rank
    });
  }

  /**
   * 获取相似度等级
   * @returns {string} 相似度等级
   */
  getSimilarityLevel() {
    if (this.similarity >= 90) return 'excellent';
    if (this.similarity >= 80) return 'very-good';
    if (this.similarity >= 70) return 'good';
    if (this.similarity >= 60) return 'fair';
    return 'poor';
  }

  /**
   * 获取相似度颜色
   * @returns {string} 颜色类名
   */
  getSimilarityColor() {
    const level = this.getSimilarityLevel();
    const colorMap = {
      excellent: 'text-green-600',
      'very-good': 'text-green-500',
      good: 'text-yellow-500',
      fair: 'text-orange-500',
      poor: 'text-red-500'
    };
    return colorMap[level] || 'text-gray-500';
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
