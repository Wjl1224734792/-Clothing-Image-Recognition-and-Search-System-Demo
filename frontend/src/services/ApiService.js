/**
 * API服务类
 * 处理与后端API的通信
 */
export class ApiService {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  /**
   * 发送HTTP请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片文件
   * @param {FileList} files - 文件列表
   * @param {string} correlationId - 关联ID
   * @param {Function} onProgress - 进度回调函数
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImages(filesWithUuid, correlationId = null, onProgress = null) {
    const formData = new FormData();
    
    // 添加文件和UUID
    Array.from(filesWithUuid).forEach(({ file, uuid }) => {
      formData.append('images', file);
      formData.append('uuids', uuid);
    });
    
    // 添加关联ID
    if (correlationId) {
      formData.append('correlation_id', correlationId);
    }

    // 使用XMLHttpRequest支持进度监听
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }
      
      // 监听请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('响应解析失败'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || `HTTP ${xhr.status}: ${xhr.statusText}`));
          } catch (error) {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });
      
      // 监听请求错误
      xhr.addEventListener('error', () => {
        reject(new Error('网络请求失败'));
      });
      
      // 监听请求超时
      xhr.addEventListener('timeout', () => {
        reject(new Error('请求超时'));
      });
      
      // 设置超时时间（30秒）
      xhr.timeout = 30000;
      
      // 发送请求
      xhr.open('POST', `${this.baseUrl}/api/images/upload`);
      xhr.send(formData);
    });
  }

  /**
   * 通过字符串方式插入图片
   * @param {Object} imageData - 图片数据
   * @param {string} imageData.image_path - 图片路径
   * @param {string} imageData.image_data - 图片二进制数据
   * @param {string} imageData.image_url - 图片URL
   * @param {string} imageData.correlation_id - 关联ID
   * @returns {Promise<Object>} 插入结果
   */
  async insertImage(imageData) {
    return await this.request('/api/images/insert', {
      method: 'POST',
      body: JSON.stringify(imageData)
    });
  }

  /**
   * 通过文件上传搜索图片
   * @param {File} file - 查询图片文件
   * @param {number} limit - 返回结果数量限制
   * @returns {Promise<Object>} 搜索结果
   */
  async searchByUpload(file, limit = 20) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('limit', limit.toString());

    return await this.request('/api/images/search/upload', {
      method: 'POST',
      headers: {}, // 让浏览器自动设置Content-Type
      body: formData
    });
  }

  /**
   * 通过字符串方式搜索图片
   * @param {Object} searchData - 搜索数据
   * @param {string} searchData.image_path - 图片路径
   * @param {string} searchData.image_data - 图片二进制数据
   * @param {string} searchData.image_url - 图片URL
   * @param {number} searchData.limit - 返回结果数量限制
   * @returns {Promise<Object>} 搜索结果
   */
  async searchByString(searchData) {
    return await this.request('/api/images/search', {
      method: 'POST',
      body: JSON.stringify(searchData)
    });
  }

  /**
   * 通过Blob方式插入图片
   * @param {Object} imageData - 图片数据
   * @param {string} imageData.image_blob - 图片Blob数据
   * @param {string} imageData.image_url - 图片URL
   * @param {string} imageData.correlation_id - 关联ID
   * @returns {Promise<Object>} 插入结果
   */
  async insertImageFromBlob(imageData) {
    return await this.request('/api/images/insert/blob', {
      method: 'POST',
      body: JSON.stringify(imageData)
    });
  }

  /**
   * 通过Blob方式搜索图片
   * @param {Object} searchData - 搜索数据
   * @param {string} searchData.image_blob - 图片Blob数据
   * @param {string} searchData.image_url - 图片URL
   * @param {number} searchData.limit - 返回结果数量限制
   * @returns {Promise<Object>} 搜索结果
   */
  async searchByBlob(searchData) {
    return await this.request('/api/images/search/blob', {
      method: 'POST',
      body: JSON.stringify(searchData)
    });
  }

  /**
   * 通过Blob方式更新嵌入数据
   * @param {string} correlationId - 关联ID
   * @param {Object} imageData - 图片数据
   * @param {string} imageData.image_blob - 图片Blob数据
   * @param {string} imageData.image_url - 图片URL
   * @returns {Promise<Object>} 更新结果
   */
  async updateEmbeddingByBlob(correlationId, imageData) {
    return await this.request(`/api/images/correlation/${correlationId}/update/blob`, {
      method: 'POST',
      body: JSON.stringify(imageData)
    });
  }


  /**
   * 健康检查
   * @returns {Promise<Object>} 健康状态
   */
  async healthCheck() {
    return await this.request('/api/health');
  }
}
