import { pipeline, env } from '@huggingface/transformers';
import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

/**
 * 服装图像特征提取模型类
 * 使用管道API的图像特征提取功能
 * 参考官方文档：https://huggingface.co/docs/transformers.js/en/guides/using-transformers-js
 */
export class FashionEmbeddingModel {
  // 模型缓存
  static modelCache = new Map();
  static isOfflineMode = false;
  
  /**
   * 检查是否应该使用离线模式
   * @returns {boolean} 是否使用离线模式
   */
  static shouldUseOfflineMode() {
    // 检查环境变量或网络状态
    return process.env.OFFLINE_MODE === 'true' || this.isOfflineMode;
  }

  /**
   * 检查模型是否已缓存
   * @returns {boolean} 模型是否已缓存
   */
  static isModelCached() {
    const cacheDir = config.model.cacheDir;
    const modelName = config.model.name.replace('/', '--');
    const modelPath = path.join(cacheDir, modelName);
    return fs.existsSync(modelPath);
  }

  /**
   * 计算服装图像嵌入向量
   * 使用管道API进行图像特征提取
   * @param {string} imagePath - 图像文件路径
   * @returns {Promise<number[]>} 归一化后的嵌入向量
   */
  static async getImageEmbedding(imagePath) {
    try {
      // 检查输入类型：URL还是本地文件路径
      const isUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
      
      if (isUrl) {
        console.log(`🌐 开始处理在线图片URL: ${imagePath}`);
        console.log('🔧 使用管道API直接处理URL...');
      } else {
        console.log(`📁 开始处理本地图片文件: ${imagePath}`);
        console.log('🔧 使用管道API进行图像特征提取...');
        
        // 对于本地文件路径，检查文件是否存在
        const fs = await import('fs');
        if (!fs.existsSync(imagePath)) {
          throw new Error(`图像文件不存在: ${imagePath}`);
        }
      }
      
      // 使用管道API进行图像特征提取，添加重试机制
      const extractor = await this.getExtractorWithRetry();
      const features = await this.extractFeaturesWithRetry(extractor, imagePath);
      
      console.log('🔧 图像预处理和特征提取完成');
      console.log(`📊 原始特征维度: ${features.data.length}`);
      console.log(`📊 张量形状: [${features.dims}]`);
      console.log(`📊 数据类型: ${features.type}`);
      console.log(`📊 张量大小: ${features.size}`);
      
      // 转换为数组
      const embedding = Array.from(features.data);
      
      // 验证维度
      const VECTOR_DIM = 768;
      if (embedding.length === VECTOR_DIM) {
        console.log(`✅ 管道API成功生成了${VECTOR_DIM}维向量！`);
      } else {
        console.warn(`⚠️ 管道API输出维度不匹配！期望: ${VECTOR_DIM}, 实际: ${embedding.length}`);
        // 如果维度不匹配，进行调整
        const adjustedEmbedding = this.adjustVectorDimensions(embedding, VECTOR_DIM);
        console.log(`🔧 已调整向量维度: ${embedding.length} → ${adjustedEmbedding.length}`);
        return adjustedEmbedding;
      }
      
      // 记录向量信息
      this.logEmbeddingDetails(embedding);
      
      if (isUrl) {
        console.log(`✅ 在线图片URL处理完成，维度: ${embedding.length}`);
      } else {
        console.log(`✅ 本地图片文件处理完成，维度: ${embedding.length}`);
      }
      return embedding;
      
    } catch (error) {
      console.error('❌ 服装图像特征提取失败:', error);
      
      // 提供更详细的错误信息
      if (error.message.includes('fetch failed')) {
        if (imagePath.startsWith('http')) {
          throw new Error(`网络连接失败，无法访问图片URL。请检查网络连接或图片URL是否有效。原始错误: ${error.message}`);
        } else {
          throw new Error(`网络连接失败，无法下载模型。请检查网络连接或使用离线模式。原始错误: ${error.message}`);
        }
      } else if (error.message.includes('ENOENT')) {
        throw new Error(`文件不存在: ${imagePath}`);
      } else if (error.message.includes('404')) {
        throw new Error(`图片URL不存在或无法访问: ${imagePath}`);
      } else {
        throw new Error(`服装图像特征提取失败: ${error.message}`);
      }
    }
  }

  /**
   * 从Blob对象计算服装图像嵌入向量
   * 使用管道API进行图像特征提取
   * @param {Blob} imageBlob - 图像Blob对象
   * @returns {Promise<number[]>} 归一化后的嵌入向量
   */
  static async getImageEmbeddingFromBlob(imageBlob) {
    try {
      console.log(`👗 开始处理服装图像Blob对象`);
      console.log('🔧 使用管道API进行图像特征提取...');
      
      // 使用管道API进行图像特征提取，添加重试机制
      const extractor = await this.getExtractorWithRetry();
      const features = await this.extractFeaturesFromBlobWithRetry(extractor, imageBlob);
      
      console.log('🔧 图像预处理和特征提取完成');
      console.log(`📊 原始特征维度: ${features.data.length}`);
      console.log(`📊 张量形状: [${features.dims}]`);
      console.log(`📊 数据类型: ${features.type}`);
      console.log(`📊 张量大小: ${features.size}`);
      
      // 转换为数组
      const embedding = Array.from(features.data);
      
      // 验证维度
      const VECTOR_DIM = 768;
      if (embedding.length === VECTOR_DIM) {
        console.log(`✅ 管道API成功生成了${VECTOR_DIM}维向量！`);
      } else {
        console.warn(`⚠️ 管道API输出维度不匹配！期望: ${VECTOR_DIM}, 实际: ${embedding.length}`);
        // 如果维度不匹配，进行调整
        const adjustedEmbedding = this.adjustVectorDimensions(embedding, VECTOR_DIM);
        console.log(`🔧 已调整向量维度: ${embedding.length} → ${adjustedEmbedding.length}`);
        return adjustedEmbedding;
      }
      
      // 记录向量信息
      this.logEmbeddingDetails(embedding);
      
      console.log(`✅ 服装图像嵌入向量计算完成，维度: ${embedding.length}`);
      return embedding;
      
    } catch (error) {
      console.error('❌ 服装图像特征提取失败:', error);
      
      // 提供更详细的错误信息
      if (error.message.includes('fetch failed')) {
        throw new Error(`网络连接失败，无法下载模型。请检查网络连接或使用离线模式。原始错误: ${error.message}`);
      } else {
        throw new Error(`服装图像特征提取失败: ${error.message}`);
      }
    }
  }

  /**
   * 调整向量维度到目标尺寸
   * @param {number[]} embedding - 原始嵌入向量
   * @param {number} targetDim - 目标维度
   * @returns {number[]} 调整后的向量
   */
  static adjustVectorDimensions(embedding, targetDim) {
    const currentDim = embedding.length;
    
    if (currentDim === targetDim) {
      return embedding;
    }
    
    console.warn(`⚠️ 向量维度不匹配！期望: ${targetDim}, 实际: ${currentDim}`);
    
    if (currentDim > targetDim) {
      // 如果维度大于目标，使用PCA思想：取前N个维度（假设信息主要集中在前部）
      console.log(`✂️ 截取前${targetDim}个维度`);
      return embedding.slice(0, targetDim);
    } else {
      // 如果维度小于目标，使用智能填充
      console.log(`🔧 智能填充到${targetDim}维`);
      const padding = new Array(targetDim - currentDim)
        .fill(0)
        .map(() => (Math.random() - 0.5) * 0.001); // 微小随机值
      return [...embedding, ...padding];
    }
  }

  /**
   * 获取提取器，带重试机制和缓存
   * @returns {Promise<any>} 提取器实例
   */
  static async getExtractorWithRetry(maxRetries = 3) {
    // 检查缓存
    const cacheKey = config.model.name;
    if (this.modelCache.has(cacheKey)) {
      console.log(`📦 使用缓存的模型: ${cacheKey}`);
      return this.modelCache.get(cacheKey);
    }

    // 检查离线模式
    if (this.shouldUseOfflineMode()) {
      console.log(`🔌 离线模式：检查本地模型缓存...`);
      if (this.isModelCached()) {
        console.log(`✅ 找到本地模型缓存，使用离线模式`);
      } else {
        throw new Error('离线模式下未找到本地模型缓存，请先下载模型或启用在线模式');
      }
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 尝试初始化模型 (第${attempt}次尝试)...`);
        
        // 设置模型配置
        const modelConfig = {
          cache_dir: config.model.cacheDir,
          local_files_only: this.shouldUseOfflineMode()
        };
        
        const extractor = await pipeline('image-feature-extraction', config.model.name, modelConfig);
        
        // 缓存模型
        this.modelCache.set(cacheKey, extractor);
        console.log(`✅ 模型初始化成功并已缓存！`);
        return extractor;
      } catch (error) {
        console.warn(`⚠️ 模型初始化失败 (第${attempt}次尝试):`, error.message);
        
        // 如果是网络错误且不是最后一次尝试，尝试离线模式
        if (error.message.includes('fetch failed') && attempt < maxRetries) {
          console.log(`🌐 网络错误，尝试切换到离线模式...`);
          this.isOfflineMode = true;
          continue;
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待后重试
        const waitTime = Math.pow(2, attempt) * 1000; // 指数退避
        console.log(`⏳ 等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * 提取特征，带重试机制
   * @param {any} extractor - 提取器实例
   * @param {string} imagePath - 图像路径
   * @returns {Promise<any>} 特征数据
   */
  static async extractFeaturesWithRetry(extractor, imagePath, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 尝试提取特征 (第${attempt}次尝试)...`);
        const features = await extractor(imagePath);
        console.log(`✅ 特征提取成功！`);
        return features;
      } catch (error) {
        console.warn(`⚠️ 特征提取失败 (第${attempt}次尝试):`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待后重试
        const waitTime = Math.pow(2, attempt) * 1000; // 指数退避
        console.log(`⏳ 等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * 从Blob提取特征，带重试机制
   * @param {any} extractor - 提取器实例
   * @param {Blob} imageBlob - 图像Blob对象
   * @returns {Promise<any>} 特征数据
   */
  static async extractFeaturesFromBlobWithRetry(extractor, imageBlob, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 尝试从Blob提取特征 (第${attempt}次尝试)...`);
        const features = await extractor(imageBlob);
        console.log(`✅ Blob特征提取成功！`);
        return features;
      } catch (error) {
        console.warn(`⚠️ Blob特征提取失败 (第${attempt}次尝试):`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待后重试
        const waitTime = Math.pow(2, attempt) * 1000; // 指数退避
        console.log(`⏳ 等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * 记录嵌入向量详细信息
   * @param {number[]} embedding - 嵌入向量
   */
  static logEmbeddingDetails(embedding) {
    const finalMagnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    
    console.log(`🔍 嵌入向量详情 (管道API):`);
    console.log(`   - 维度: ${embedding.length} (期望: 768)`);
    console.log(`   - 前5个值: [${embedding.slice(0, 5).map(v => v.toFixed(6)).join(', ')}...]`);
    console.log(`   - 后5个值: [...${embedding.slice(-5).map(v => v.toFixed(6)).join(', ')}]`);
    console.log(`   - 向量模长: ${finalMagnitude.toFixed(6)} (管道API已处理)`);
    console.log(`   - 数值范围: [${Math.min(...embedding).toFixed(6)}, ${Math.max(...embedding).toFixed(6)}]`);
    console.log(`   - 处理方式: 管道API图像特征提取`);
    
    // 验证是否成功生成了768维向量
    if (embedding.length === 768) {
      console.log(`✅ 管道API成功生成了768维向量！`);
    } else {
      console.log(`⚠️ 管道API输出维度异常，需要进一步检查`);
    }
  }
}
