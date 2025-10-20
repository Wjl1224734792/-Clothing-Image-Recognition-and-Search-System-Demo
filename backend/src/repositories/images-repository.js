import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';
import { config } from '../../config.js';

/**
 * 图片数据访问层
 * 处理与Milvus向量数据库的交互
 */
export class ImagesRepository {
  constructor() {
    this.milvusClient = new MilvusClient({
      address: `${config.milvus.host}:${config.milvus.port}`,
      ssl: config.milvus.ssl,
      username: config.milvus.admin.username,
      password: config.milvus.admin.password,
      connectTimeout: 10000, // 10秒连接超时
      timeout: 30000 // 30秒操作超时
    });
    this.collectionName = config.vector.collectionName;
    this.vectorDim = config.vector.vectorDimension;
    this.databaseName = 'default';
    this.isInitialized = false;
  }

  /**
   * 初始化连接和集合
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('🔧 初始化Milvus连接...');
      
      // 检查连接健康性
      await this.checkConnectionHealth();
      
      // 使用默认数据库
      await this.useDatabase();
      
      // 检查并创建集合
      await this.ensureCollectionExists();
      
      this.isInitialized = true;
      console.log('✅ Milvus初始化完成');
    } catch (error) {
      console.error('❌ Milvus初始化失败:', error);
      throw new Error(`Milvus初始化失败: ${error.message}`);
    }
  }

  /**
   * 检查连接健康性
   * @returns {Promise<boolean>} 连接是否健康
   */
  async checkConnectionHealth() {
    try {
      console.log('🏥 检查Milvus连接健康性...');
      
      // 设置10秒超时
      const healthCheck = Promise.race([
        this.milvusClient.checkHealth(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('连接超时')), 10000)
        )
      ]);
      
      await healthCheck;
      console.log('✅ Milvus连接健康检查通过');
      return true;
    } catch (error) {
      console.error('❌ Milvus连接健康检查失败:', error.message);
      throw new Error(`连接健康检查失败: ${error.message}`);
    }
  }

  /**
   * 使用默认数据库
   * @returns {Promise<void>}
   */
  async useDatabase() {
    try {
      // 检查数据库是否存在
      const databasesResult = await this.milvusClient.listDatabases();
      
      // 处理不同的返回格式
      let databases = [];
      if (Array.isArray(databasesResult)) {
        databases = databasesResult;
      } else if (databasesResult && Array.isArray(databasesResult.db_names)) {
        databases = databasesResult.db_names;
      } else if (databasesResult && databasesResult.data) {
        databases = databasesResult.data;
      }
      
      if (!databases.includes(this.databaseName)) {
        console.log(`📊 创建数据库: ${this.databaseName}`);
        await this.milvusClient.createDatabase({
          db_name: this.databaseName
        });
      }
      
      // 使用数据库
      await this.milvusClient.useDatabase({
        db_name: this.databaseName
      });
      
      console.log(`✅ 已切换到数据库: ${this.databaseName}`);
    } catch (error) {
      console.error('❌ 数据库操作失败:', error);
      throw new Error(`数据库操作失败: ${error.message}`);
    }
  }

  /**
   * 确保集合存在
   * @returns {Promise<void>}
   */
  async ensureCollectionExists() {
    try {
      // 检查集合是否存在
      const hasCollection = await this.milvusClient.hasCollection({
        collection_name: this.collectionName
      });
      
      // 检查hasCollection的返回值
      const collectionExists = hasCollection.value === true;
      
      if (collectionExists) {
        console.log(`✅ 集合 ${this.collectionName} 已存在`);
        // 检查集合状态并加载
        await this.checkAndLoadCollection();
      } else {
        console.log(`📋 集合 ${this.collectionName} 不存在，正在创建...`);
        await this.createCollection();
      }
    } catch (error) {
      console.error('❌ 集合操作失败:', error);
      throw new Error(`集合操作失败: ${error.message}`);
    }
  }

  /**
   * 检查并加载集合
   * @returns {Promise<void>}
   */
  async checkAndLoadCollection() {
    try {
      // 检查集合加载状态
      const loadState = await this.milvusClient.getLoadState({
        collection_name: this.collectionName
      });
      
      if (loadState.state !== 'LoadStateLoaded') {
        console.log('🔄 集合未加载，正在加载到内存...');
        await this.milvusClient.loadCollection({
          collection_name: this.collectionName
        });
        console.log('✅ 集合已加载到内存');
      } else {
        console.log('✅ 集合已加载到内存');
      }
    } catch (error) {
      console.error('❌ 集合加载失败:', error);
      throw new Error(`集合加载失败: ${error.message}`);
    }
  }

  /**
   * 插入图片到向量数据库
   * @param {ImageModel} imageModel - 图片模型
   * @returns {Promise<Object>} 插入结果
   */
  async insertImage(imageModel) {
    try {
      console.log('📥 准备插入数据到Milvus...');
      console.log(`   - 文件路径: ${imageModel.file_path}`);
      console.log(`   - 关联ID: ${imageModel.correlation_id}`);
      console.log(`   - 嵌入向量维度: ${imageModel.image_embedding.length}`);

      const insertResult = await this.milvusClient.insert({
        collection_name: this.collectionName,
        data: [{
          file_path: imageModel.file_path,
          correlation_id: imageModel.correlation_id,
          image_embedding: imageModel.image_embedding
        }]
      });

      console.log('✅ 图片插入成功');
      return insertResult;
    } catch (error) {
      console.error('❌ 插入图片到Milvus失败:', error);
      throw new Error(`插入图片失败: ${error.message}`);
    }
  }

  /**
   * 搜索相似图片
   * @param {Array<number>} queryEmbedding - 查询向量
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Array>} 搜索结果
   */
  async searchImages(queryEmbedding, limit = 20) {
    try {
      console.log('🔍 开始向量相似性搜索...');

      const searchResult = await this.milvusClient.search({
        collection_name: this.collectionName,
        data: queryEmbedding,
        limit: limit,
        output_fields: ['file_path', 'correlation_id'],
        filter: '', // 无筛选条件
        metric_type: 'L2'
      });

      // 处理搜索结果
      if (searchResult.results && searchResult.results.length > 0) {
        return searchResult.results.map(item => ({
          file_path: item.file_path,
          score: item.score,
          id: item.id,
          correlation_id: item.correlation_id
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ 搜索图片失败:', error);
      throw new Error(`搜索图片失败: ${error.message}`);
    }
  }




  /**
   * 根据correlation_id删除图片
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteImagesByCorrelationId(correlationId) {
    try {
      console.log(`🗑️ 根据correlation_id删除图片: ${correlationId}`);

      // 使用filter条件删除，符合Milvus官方文档规范
      const deleteResult = await this.milvusClient.delete({
        collection_name: this.collectionName,
        filter: `correlation_id == "${correlationId}"`,
        timeout: 30000 // 30秒超时
      });

      console.log('🗑️ 删除结果:', deleteResult);
      return {
        success: true,
        deletedCount: deleteResult.delete_cnt || 0,
        correlationId: correlationId,
        status: deleteResult
      };
    } catch (error) {
      console.error('❌ 根据correlation_id删除图片失败:', error);
      throw new Error(`根据correlation_id删除图片失败: ${error.message}`);
    }
  }


  /**
   * 根据correlation_id查询图片
   * @param {string} correlationId - 关联ID
   * @returns {Promise<Array>} 查询结果
   */
  async getImagesByCorrelationId(correlationId) {
    try {
      console.log(`🔍 根据correlation_id查询图片: ${correlationId}`);

      const queryResult = await this.milvusClient.query({
        collection_name: this.collectionName,
        filter: `correlation_id == "${correlationId}"`,
        output_fields: ['image_id', 'file_path', 'correlation_id']
      });

      console.log('🔍 查询结果:', queryResult);
      return queryResult.data || [];
    } catch (error) {
      console.error('❌ 根据correlation_id查询图片失败:', error);
      throw new Error(`根据correlation_id查询图片失败: ${error.message}`);
    }
  }


  /**
   * 更新correlation_id对应的嵌入数据（使用upsert方法）
   * @param {string} correlationId - 关联ID
   * @param {Array} embeddingData - 新的嵌入数据数组
   * @returns {Promise<Object>} 更新结果
   */
  async updateEmbeddingByCorrelationId(correlationId, embeddingData) {
    try {
      console.log(`🔄 更新correlation_id为${correlationId}的嵌入数据`);
      console.log(`📊 处理${embeddingData.length}条嵌入数据`);

      // 先查询现有的记录，获取image_id
      const queryResult = await this.milvusClient.query({
        collection_name: this.collectionName,
        filter: `correlation_id == "${correlationId}"`,
        output_fields: ['image_id', 'file_path', 'correlation_id']
      });

      if (!queryResult.data || queryResult.data.length === 0) {
        throw new Error(`未找到correlation_id为${correlationId}的图片记录`);
      }

      console.log(`📊 找到 ${queryResult.data.length} 条现有记录`);

      // 准备upsert数据，保持原有的image_id，更新嵌入向量
      const upsertRecords = queryResult.data.map((record, index) => {
        const embeddingRecord = embeddingData[index] || embeddingData[0]; // 如果嵌入数据不够，使用第一个
        return {
          image_id: record.image_id, // 保持原有ID
          file_path: embeddingRecord.file_path || record.file_path,
          correlation_id: correlationId,
          image_embedding: embeddingRecord.image_embedding
        };
      });

      // 使用upsert更新嵌入数据，符合Milvus官方文档规范
      const upsertResult = await this.milvusClient.upsert({
        collection_name: this.collectionName,
        data: upsertRecords,
        timeout: 30000 // 30秒超时
      });

      console.log('🔄 嵌入数据更新结果:', upsertResult);
      return {
        success: true,
        upsertedCount: upsertResult.upsert_cnt || 0,
        insertedCount: upsertResult.insert_cnt || 0,
        deletedCount: upsertResult.delete_cnt || 0,
        correlationId: correlationId,
        updatedRecords: queryResult.data.length,
        upsertResult: upsertResult
      };
    } catch (error) {
      console.error('❌ 更新嵌入数据失败:', error);
      throw new Error(`更新嵌入数据失败: ${error.message}`);
    }
  }

  /**
   * 创建集合和索引
   * @returns {Promise<void>}
   */
  async createCollection() {
    const schema = [
      {
        name: 'image_id',
        data_type: DataType.Int64,
        is_primary_key: true,
        autoID: true,
      },
      {
        name: 'file_path',
        data_type: DataType.VarChar,
        max_length: 500,
      },
      {
        name: 'correlation_id',
        data_type: DataType.VarChar,
        max_length: 100,
      },
      {
        name: 'image_embedding',
        data_type: DataType.FloatVector,
        dim: this.vectorDim,
      }
    ];

    try {
      console.log(`📊 创建集合: ${this.collectionName}`);
      
      // 创建集合
      await this.milvusClient.createCollection({
        collection_name: this.collectionName,
        fields: schema,
        description: 'Fashion images collection with vector embeddings'
      });
      
      // 创建索引
      console.log('🔍 创建向量索引...');
      await this.milvusClient.createIndex({
        collection_name: this.collectionName,
        field_name: 'image_embedding',
        index_name: 'vector_index',
        index_type: config.vector.indexType,
        metric_type: config.vector.metricType,
        params: config.vector.indexParams
      });
      
      // 加载集合到内存
      console.log('🔄 加载集合到内存...');
      await this.milvusClient.loadCollection({
        collection_name: this.collectionName
      });
      
      console.log('✅ 集合和索引创建成功，集合已加载到内存');
    } catch (error) {
      console.error('❌ 创建集合失败:', error);
      throw new Error(`创建集合失败: ${error.message}`);
    }
  }

  /**
   * 检查集合状态
   * @returns {Promise<Object>} 集合状态
   */
  async checkCollectionStatus() {
    try {
      console.log('🔍 检查集合状态...');
      
      // 检查集合是否存在
      const hasCollection = await this.milvusClient.hasCollection({
        collection_name: this.collectionName
      });
      
      if (!hasCollection) {
        console.log('⚠️ 集合不存在，需要重新创建');
        return { exists: false, loaded: false };
      }
      
      // 检查集合是否已加载
      const loadState = await this.milvusClient.getLoadState({
        collection_name: this.collectionName
      });
      
      if (loadState.state !== 'LoadStateLoaded') {
        console.log('🔄 集合未加载，正在加载到内存...');
        await this.milvusClient.loadCollection({
          collection_name: this.collectionName
        });
        console.log('✅ 集合已加载到内存');
        return { exists: true, loaded: true };
      } else {
        console.log('✅ 集合已加载到内存');
        return { exists: true, loaded: true };
      }
    } catch (error) {
      console.error('❌ 检查集合状态失败:', error);
      return { exists: false, loaded: false, error: error.message };
    }
  }
}
