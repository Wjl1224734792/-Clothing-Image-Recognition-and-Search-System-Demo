import { ImagesRepository } from '../repositories/images-repository.js';
import { FashionEmbeddingModel } from '../models/fashion-embedding-model.js';
import { ImageModel } from '../models/image-model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块兼容性处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 图片服务层
 * 处理图片相关的业务逻辑
 */
export class ImagesService {
  constructor() {
    this.imagesRepository = new ImagesRepository();
    this.isInitialized = false;
  }

  /**
   * 初始化服务
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔧 初始化图片服务...');
      
      // 初始化仓库
      await this.imagesRepository.initialize();
      
      this.isInitialized = true;
      console.log('✅ 图片服务初始化完成');
    } catch (error) {
      console.error('❌ 图片服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 从文件上传插入图片到向量数据库
   * @param {Array} files - 上传的文件数组
   * @param {string} correlation_id - 关联ID
   * @returns {Promise<Array>} 插入结果
   */
  async insertImagesFromFiles(files, correlation_id, uuids = []) {
    const results = [];
    
    // 使用for...of确保顺序处理，避免并发问题
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uuid = uuids[i] || this.generateUUID();
      
      try {
        // 生成嵌入向量
        const embedding = await FashionEmbeddingModel.getImageEmbedding(file.path);
        
        // 使用UUID作为文件名
        const uuidFilename = `${uuid}.${file.originalname.split('.').pop()}`;
        
        // 重命名文件
        const oldPath = file.path;
        const newPath = path.join(path.dirname(oldPath), uuidFilename);
        
        fs.renameSync(oldPath, newPath);
        
        // 创建图片模型 - 存储绝对路径
        const imageModel = new ImageModel({
          file_path: path.resolve(newPath),
          correlation_id: correlation_id || null,
          image_embedding: embedding
        });

        // 插入到向量数据库
        const insertResult = await this.imagesRepository.insertImage(imageModel);
        
        results.push({
          filePath: imageModel.file_path,
          vectorId: insertResult.IDs,
          correlation_id: imageModel.correlation_id,
          status: 'success'
        });
      } catch (error) {
        console.error(`❌ 处理文件 ${file.filename} 失败:`, error);
        results.push({
          filePath: `uploads/${file.filename}`,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 批量插入图片到向量数据库（通过文件路径）
   * @param {Array} imagePaths - 图片文件路径数组
   * @param {string} correlation_id - 关联ID
   * @param {string} batch_name - 批次名称
   * @returns {Promise<Array>} 插入结果
   */
  async batchInsertImagesFromPaths(imagePaths, correlation_id, batch_name = '') {
    const results = [];
    const batchId = this.generateUUID();
    const finalCorrelationId = correlation_id || `batch_${batchId}`;
    
    console.log(`🚀 开始批量处理 ${imagePaths.length} 张图片，批次: ${batch_name || finalCorrelationId}`);
    
    // 使用for...of确保顺序处理，避免并发问题
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      
      try {
        // 检查文件是否存在
        if (!fs.existsSync(imagePath)) {
          throw new Error(`文件不存在: ${imagePath}`);
        }
        
        // 读取图像文件并转换为Blob对象
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = this.getMimeType(imagePath);
        const imageBlob = new Blob([imageBuffer], { type: mimeType });
        
        // 生成嵌入向量（使用Blob对象）
        const embedding = await FashionEmbeddingModel.getImageEmbeddingFromBlob(imageBlob);
        
        // 创建图片模型 - 存储绝对路径
        const absolutePath = path.resolve(imagePath);
        const imageModel = new ImageModel({
          file_path: absolutePath,
          correlation_id: finalCorrelationId,
          image_embedding: embedding
        });

        // 插入到向量数据库
        const insertResult = await this.imagesRepository.insertImage(imageModel);
        
        results.push({
          filePath: imageModel.file_path,
          vectorId: insertResult.IDs,
          correlation_id: imageModel.correlation_id,
          status: 'success',
          batch_name: batch_name
        });
        
        console.log(`✅ 处理完成 ${i + 1}/${imagePaths.length}: ${path.basename(imagePath)}`);
      } catch (error) {
        console.error(`❌ 处理文件失败 ${imagePath}:`, error);
        results.push({
          filePath: imagePath,
          status: 'failed',
          error: error.message,
          batch_name: batch_name
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.length - successCount;
    console.log(`📊 批量处理完成！成功: ${successCount}, 失败: ${failCount}`);
    
    return results;
  }

  /**
   * 获取文件的MIME类型
   * @param {string} filePath - 文件路径
   * @returns {string} MIME类型
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * 从字符串方式插入图片到向量数据库
   * @param {Object} imageData - 图片数据对象
   * @param {string} imageData.image_path - 图片路径
   * @param {string} imageData.image_data - 图片二进制数据
   * @param {string} imageData.image_url - 图片URL
   * @param {string} imageData.correlation_id - 关联ID
   * @returns {Promise<Object>} 插入结果
   */
  async insertImageFromString({ image_path, image_data, image_url, correlation_id }) {
    let imagePath;
    let embedding;

    // 处理不同的图片输入方式
    if (image_path) {
      // 从文件路径处理
      const fullPath = path.isAbsolute(image_path) 
        ? image_path 
        : path.join(__dirname, '..', '..', image_path);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`图片文件不存在: ${fullPath}`);
      }
      
      imagePath = path.resolve(fullPath); // 存储绝对路径
      embedding = await FashionEmbeddingModel.getImageEmbedding(fullPath);
    } else if (image_data) {
      // 从二进制数据处理
      const tempPath = await this.saveImageDataToTemp(image_data);
      imagePath = path.resolve(tempPath); // 存储绝对路径
      embedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
    } else if (image_url) {
      // 从URL处理（需要下载图片）
      const tempPath = await this.downloadImageFromUrl(image_url);
      imagePath = path.resolve(tempPath); // 存储绝对路径
      embedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
    }

    // 创建图片模型
    const imageModel = new ImageModel({
      file_path: imagePath,
      correlation_id: correlation_id || null,
      image_embedding: embedding
    });

    // 插入到向量数据库
    const insertResult = await this.imagesRepository.insertImage(imageModel);
    
    return {
      filePath: imageModel.file_path,
      vectorId: insertResult.IDs,
      correlation_id: imageModel.correlation_id,
      status: 'success'
    };
  }

  /**
   * 从文件上传搜索相似图片
   * @param {Object} file - 上传的文件
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} 搜索结果
   */
  async searchImagesFromFile(file, limit = 20) {
    try {
      // 生成查询向量
      const queryEmbedding = await FashionEmbeddingModel.getImageEmbedding(file.path);
      
      // 执行向量搜索
      const results = await this.imagesRepository.searchImages(queryEmbedding, limit);
      
      return results.map((item, index) => {
        // 将L2距离分数转换为0-1之间的相似度分数
        // L2距离越小表示越相似，需要转换为相似度分数
        const normalizedScore = Math.max(0, Math.min(1, 1 / (1 + item.score)));
        
        return {
          filePath: item.file_path,
          score: normalizedScore, // 转换后的相似度分数（0-1之间）
          id: item.id,
          correlation_id: item.correlation_id,
          similarity: normalizedScore * 100, // 相似度百分比
          rank: index + 1
        };
      });
    } finally {
      // 搜索完成后删除临时文件
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log('🗑️ 已删除搜索临时文件:', file.path);
        }
      } catch (error) {
        console.warn('⚠️ 删除搜索临时文件失败:', error.message);
      }
    }
  }

  /**
   * 从字符串方式搜索相似图片
   * @param {Object} searchData - 搜索数据对象
   * @param {string} searchData.image_path - 图片路径
   * @param {string} searchData.image_data - 图片二进制数据
   * @param {string} searchData.image_url - 图片URL
   * @param {number} searchData.limit - 返回结果数量限制
   * @returns {Promise<Array>} 搜索结果
   */
  async searchImagesFromString({ image_path, image_data, image_url, limit = 20 }) {
    let queryEmbedding;
    let tempPath = null; // 用于跟踪临时文件路径

    try {
      // 处理不同的图片输入方式
      if (image_path) {
        // 从文件路径处理
        const fullPath = path.isAbsolute(image_path) 
          ? image_path 
          : path.join(__dirname, '..', '..', image_path);
        
        if (!fs.existsSync(fullPath)) {
          throw new Error(`图片文件不存在: ${fullPath}`);
        }
        
        queryEmbedding = await FashionEmbeddingModel.getImageEmbedding(fullPath);
      } else if (image_data) {
        // 从二进制数据处理
        tempPath = await this.saveImageDataToTemp(image_data);
        queryEmbedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
      } else if (image_url) {
        // 从URL处理
        tempPath = await this.downloadImageFromUrl(image_url);
        queryEmbedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
      }

      // 执行向量搜索
      const results = await this.imagesRepository.searchImages(queryEmbedding, limit);
      
      return results.map((item, index) => {
        // 将L2距离分数转换为0-1之间的相似度分数
        // L2距离越小表示越相似，需要转换为相似度分数
        const normalizedScore = Math.max(0, Math.min(1, 1 / (1 + item.score)));
        
        return {
          filePath: item.file_path,
          score: normalizedScore, // 转换后的相似度分数（0-1之间）
          id: item.id,
          correlation_id: item.correlation_id,
          similarity: normalizedScore * 100, // 相似度百分比
          rank: index + 1
        };
      });
    } finally {
      // 搜索完成后删除临时文件
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
          console.log('🗑️ 已删除搜索临时文件:', tempPath);
        } catch (error) {
          console.warn('⚠️ 删除搜索临时文件失败:', error.message);
        }
      }
    }
  }


  /**
   * 根据correlation_id删除图片
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteImagesByCorrelationId(correlationId) {
    return await this.imagesRepository.deleteImagesByCorrelationId(correlationId);
  }


  /**
   * 根据correlation_id查询图片
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Array>} 查询结果
   */
  async getImagesByCorrelationId(correlationId) {
    return await this.imagesRepository.getImagesByCorrelationId(correlationId);
  }


  /**
   * 通过文件上传方式更新correlation_id的嵌入数据
   * @param {Array} files - 上传的文件数组
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Object>} 更新结果
   */
  async updateImagesEmbeddingFromFiles(files, correlationId) {
    try {
      console.log(`🔄 通过文件上传方式更新correlation_id为${correlationId}的嵌入数据`);
      console.log(`📁 处理${files.length}个文件`);

      const embeddingData = [];
      
      for (const file of files) {
        try {
          console.log(`🔄 处理文件: ${file.originalname}`);
          
          // 生成图片嵌入向量
          const embedding = await FashionEmbeddingModel.getImageEmbedding(file.path);
          
          // 创建嵌入数据记录
          embeddingData.push({
            file_path: file.path,
            correlation_id: correlationId,
            image_embedding: embedding
          });

          console.log(`✅ 文件${file.originalname}嵌入向量生成成功`);
        } catch (error) {
          console.error(`❌ 处理文件${file.originalname}失败:`, error);
          throw new Error(`处理文件${file.originalname}失败: ${error.message}`);
        }
      }

      // 使用upsert方法更新嵌入数据
      const updateResult = await this.imagesRepository.updateEmbeddingByCorrelationId(correlationId, embeddingData);

      return {
        success: true,
        correlationId: correlationId,
        totalFiles: files.length,
        updatedRecords: updateResult.updatedRecords,
        upsertedCount: updateResult.upsertedCount,
        updateResult: updateResult
      };
    } catch (error) {
      console.error('❌ 通过文件上传方式更新嵌入数据失败:', error);
      throw new Error(`通过文件上传方式更新嵌入数据失败: ${error.message}`);
    }
  }

  /**
   * 通过字符串方式更新correlation_id的嵌入数据
   * @param {Object} imageData - 图片数据
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Object>} 更新结果
   */
  async updateImagesEmbeddingFromString({ image_path, image_data, image_url }, correlationId) {
    try {
      console.log(`🔄 通过字符串方式更新correlation_id为${correlationId}的嵌入数据`);

      let imageSource;
      let tempPath = null;

      try {
        if (image_path) {
          const fullPath = path.isAbsolute(image_path) 
            ? image_path 
            : path.join(__dirname, '..', '..', image_path);
          
          if (!fs.existsSync(fullPath)) {
            throw new Error(`图片文件不存在: ${fullPath}`);
          }
          imageSource = fullPath;
        } else if (image_data) {
          tempPath = await this.saveImageDataToTemp(image_data);
          imageSource = tempPath;
        } else if (image_url) {
          tempPath = await this.downloadImageFromUrl(image_url);
          imageSource = tempPath;
        } else {
          throw new Error('请提供图片路径、图片数据或图片URL');
        }

        // 生成图片嵌入向量
        const embedding = await FashionEmbeddingModel.getImageEmbedding(imageSource);
        
        // 创建嵌入数据记录
        const embeddingData = [{
          file_path: image_path || tempPath,
          correlation_id: correlationId,
          image_embedding: embedding
        }];

        // 使用upsert方法更新嵌入数据
        const updateResult = await this.imagesRepository.updateEmbeddingByCorrelationId(correlationId, embeddingData);

        return {
          success: true,
          correlationId: correlationId,
          filePath: image_path || tempPath,
          updatedRecords: updateResult.updatedRecords,
          upsertedCount: updateResult.upsertedCount,
          updateResult: updateResult
        };
      } finally {
        // 清理临时文件
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
          console.log('🗑️ 已删除更新临时文件:', tempPath);
        }
      }
    } catch (error) {
      console.error('❌ 通过字符串方式更新嵌入数据失败:', error);
      throw new Error(`通过字符串方式更新嵌入数据失败: ${error.message}`);
    }
  }

  /**
   * 从Blob方式插入图片到向量数据库
   * @param {Object} imageData - 图片数据对象
   * @param {string} imageData.image_blob - 图片Blob数据
   * @param {string} imageData.image_url - 图片URL
   * @param {string} imageData.correlation_id - 关联ID
   * @returns {Promise<Object>} 插入结果
   */
  async insertImageFromBlob({ image_blob, image_url, correlation_id }) {
    let imagePath;
    let embedding;
    let tempPath = null;

    try {
      // 处理不同的图片输入方式
      if (image_blob) {
        // 从Blob数据处理
        tempPath = await this.saveBlobDataToTemp(image_blob);
        imagePath = `temp/${path.basename(tempPath)}`;
        embedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
      } else if (image_url) {
        // 从URL处理（需要下载图片）
        tempPath = await this.downloadImageFromUrl(image_url);
        imagePath = `temp/${path.basename(tempPath)}`;
        embedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
      }

      // 创建图片模型
      const imageModel = new ImageModel({
        file_path: imagePath,
        correlation_id: correlation_id || null,
        image_embedding: embedding
      });

      // 插入到向量数据库
      const insertResult = await this.imagesRepository.insertImage(imageModel);
      
      return {
        filePath: imageModel.file_path,
        vectorId: insertResult.IDs,
        correlation_id: imageModel.correlation_id,
        status: 'success'
      };
    } finally {
      // 清理临时文件
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
          console.log('🗑️ 已删除Blob临时文件:', tempPath);
        } catch (error) {
          console.warn('⚠️ 删除Blob临时文件失败:', error.message);
        }
      }
    }
  }

  /**
   * 从Blob方式搜索相似图片
   * @param {Object} searchData - 搜索数据对象
   * @param {string} searchData.image_blob - 图片Blob数据
   * @param {string} searchData.image_url - 图片URL
   * @param {number} searchData.limit - 返回结果数量限制
   * @returns {Promise<Array>} 搜索结果
   */
  async searchImagesFromBlob({ image_blob, image_url, limit = 20 }) {
    let queryEmbedding;
    let tempPath = null; // 用于跟踪临时文件路径

    try {
      // 处理不同的图片输入方式
      if (image_blob) {
        // 从Blob数据处理
        tempPath = await this.saveBlobDataToTemp(image_blob);
        queryEmbedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
      } else if (image_url) {
        // 从URL处理
        tempPath = await this.downloadImageFromUrl(image_url);
        queryEmbedding = await FashionEmbeddingModel.getImageEmbedding(tempPath);
      }

      // 执行向量搜索
      const results = await this.imagesRepository.searchImages(queryEmbedding, limit);
      
      return results.map((item, index) => {
        // 将L2距离分数转换为0-1之间的相似度分数
        // L2距离越小表示越相似，需要转换为相似度分数
        const normalizedScore = Math.max(0, Math.min(1, 1 / (1 + item.score)));
        
        return {
          filePath: item.file_path,
          score: normalizedScore, // 转换后的相似度分数（0-1之间）
          id: item.id,
          correlation_id: item.correlation_id,
          similarity: normalizedScore * 100, // 相似度百分比
          rank: index + 1
        };
      });
    } finally {
      // 搜索完成后删除临时文件
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
          console.log('🗑️ 已删除Blob搜索临时文件:', tempPath);
        } catch (error) {
          console.warn('⚠️ 删除Blob搜索临时文件失败:', error.message);
        }
      }
    }
  }

  /**
   * 保存图片数据到临时文件
   * @param {string} imageData - 图片二进制数据
   * @returns {Promise<string>} 临时文件路径
   */
  async saveImageDataToTemp(imageData) {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const tempPath = path.join(tempDir, `${timestamp}_${randomStr}.jpg`);

    // 处理base64数据
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
  }

  /**
   * 保存Blob数据到临时文件
   * @param {string} blobData - 图片Blob数据
   * @returns {Promise<string>} 临时文件路径
   */
  async saveBlobDataToTemp(blobData) {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const tempPath = path.join(tempDir, `${timestamp}_${randomStr}.jpg`);

    // 处理Blob数据（假设是base64格式）
    const base64Data = blobData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
  }

  /**
   * 通过Blob方式更新correlation_id的嵌入数据
   * @param {Object} imageData - 图片数据
   * @param {string} imageData.image_blob - 图片Blob数据
   * @param {string} imageData.image_url - 图片URL
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Object>} 更新结果
   */
  async updateImagesEmbeddingFromBlob({ image_blob, image_url }, correlationId) {
    try {
      console.log(`🔄 通过Blob方式更新correlation_id为${correlationId}的嵌入数据`);

      let imageSource;
      let tempPath = null;

      try {
        if (image_blob) {
          tempPath = await this.saveBlobDataToTemp(image_blob);
          imageSource = tempPath;
        } else if (image_url) {
          tempPath = await this.downloadImageFromUrl(image_url);
          imageSource = tempPath;
        } else {
          throw new Error('请提供图片Blob数据或图片URL');
        }

        // 生成图片嵌入向量
        const embedding = await FashionEmbeddingModel.getImageEmbedding(imageSource);
        
        // 创建嵌入数据记录
        const embeddingData = [{
          file_path: image_url || tempPath,
          correlation_id: correlationId,
          image_embedding: embedding
        }];

        // 使用upsert方法更新嵌入数据
        const updateResult = await this.imagesRepository.updateEmbeddingByCorrelationId(correlationId, embeddingData);

        return {
          success: true,
          correlationId: correlationId,
          filePath: image_url || tempPath,
          updatedRecords: updateResult.updatedRecords,
          upsertedCount: updateResult.upsertedCount,
          updateResult: updateResult
        };
      } finally {
        // 清理临时文件
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
          console.log('🗑️ 已删除Blob更新临时文件:', tempPath);
        }
      }
    } catch (error) {
      console.error('❌ 通过Blob方式更新嵌入数据失败:', error);
      throw new Error(`通过Blob方式更新嵌入数据失败: ${error.message}`);
    }
  }

  /**
   * 获取相对路径
   * @param {string} fullPath - 完整路径
   * @returns {string} 相对路径
   */
  getRelativePath(fullPath) {
    // 如果已经是相对路径，直接返回
    if (!path.isAbsolute(fullPath)) {
      return fullPath;
    }
    
    // 提取文件名作为相对路径
    const fileName = path.basename(fullPath);
    return `uploads/${fileName}`;
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
   * 从URL获取图片（直接使用URL，不下载）
   * @param {string} imageUrl - 图片URL
   * @returns {Promise<string>} 图片URL（直接返回）
   */
  async downloadImageFromUrl(imageUrl) {
    // 直接返回URL，让管道API处理
    console.log(`✅ 使用图片URL: ${imageUrl}`);
    return imageUrl;
  }
}
