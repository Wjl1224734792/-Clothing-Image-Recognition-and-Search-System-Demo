/**
 * 图片模型
 * 定义图片实体的数据结构和验证规则
 */
export class ImageModel {
  constructor(data) {
    this.image_id = data.image_id || null; // 自增主键，由Milvus自动生成
    this.file_path = data.file_path; // 文件路径
    this.correlation_id = data.correlation_id || null; // 关联ID
    this.image_embedding = data.image_embedding; // 图片嵌入向量（主键）
    
    // 验证必需字段
    this.validate();
  }

  /**
   * 验证模型数据
   * @throws {Error} 验证失败时抛出错误
   */
  validate() {
    if (!this.file_path) {
      throw new Error('文件路径不能为空');
    }

    if (!this.image_embedding || !Array.isArray(this.image_embedding)) {
      throw new Error('图片嵌入向量不能为空且必须是数组');
    }

    if (this.image_embedding.length !== 768) {
      throw new Error(`图片嵌入向量维度必须为768，当前为${this.image_embedding.length}`);
    }

    // 验证文件路径格式
    if (typeof this.file_path !== 'string' || this.file_path.trim() === '') {
      throw new Error('文件路径必须是有效的字符串');
    }

    // 验证关联ID格式（如果提供）
    if (this.correlation_id && typeof this.correlation_id !== 'string') {
      throw new Error('关联ID必须是字符串类型');
    }
  }

  /**
   * 转换为Milvus插入格式
   * @returns {Object} Milvus数据格式
   */
  toMilvusFormat() {
    return {
      file_path: this.file_path,
      correlation_id: this.correlation_id,
      image_embedding: this.image_embedding
    };
  }

  /**
   * 从Milvus查询结果创建模型
   * @param {Object} milvusResult - Milvus查询结果
   * @returns {ImageModel} 图片模型实例
   */
  static fromMilvusResult(milvusResult) {
    return new ImageModel({
      image_id: milvusResult.image_id,
      file_path: milvusResult.file_path,
      correlation_id: milvusResult.correlation_id,
      image_embedding: milvusResult.image_embedding
    });
  }

  /**
   * 获取模型摘要信息
   * @returns {Object} 模型摘要
   */
  getSummary() {
    return {
      image_id: this.image_id,
      file_path: this.file_path,
      correlation_id: this.correlation_id,
      embedding_dimension: this.image_embedding?.length || 0,
      has_embedding: !!this.image_embedding
    };
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
