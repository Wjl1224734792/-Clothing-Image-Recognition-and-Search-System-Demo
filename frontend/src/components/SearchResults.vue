<template>
  <div class="search-results">
    <div v-if="results.length > 0" class="results-header">
      <h3>搜索结果 ({{ results.length }} 个)</h3>
      <button @click="clearResults" class="clear-btn">清空结果</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>搜索中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="results.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h4>暂无搜索结果</h4>
      <p>请尝试搜索其他图片</p>
    </div>

    <!-- 搜索结果网格 -->
    <div v-else class="results-grid">
      <div v-for="(result, index) in results" :key="result.id" class="result-item">
        <div class="result-container">
          <img :src="getImageUrl(result)" :alt="`搜索结果 ${index + 1}`" class="result-image">
          <div class="result-overlay">
            <div class="similarity-badge" :class="getSimilarityClass(result.similarity)">
              {{ result.similarity.toFixed(1) }}%
            </div>
            <button @click="viewResult(result)" class="view-btn">👁️</button>
          </div>
        </div>
        <div class="result-info">
          <div class="result-rank">#{{ result.rank }}</div>
          <div class="result-similarity" :class="getSimilarityColorClass(result.similarity)">
            相似度: {{ result.similarity.toFixed(1) }}%
          </div>
          <div class="result-score">分数: {{ result.score.toFixed(4) }}</div>
        </div>
      </div>
    </div>

    <!-- 结果预览模态框 -->
    <div v-if="previewResult" class="result-modal" @click="closePreview">
      <div class="modal-content" @click.stop>
        <button @click="closePreview" class="close-btn">×</button>
        <img :src="getImageUrl(previewResult)" :alt="`搜索结果`" class="modal-image">
        <div class="modal-info">
          <h4>搜索结果 #{{ previewResult.rank }}</h4>
          <div class="similarity-info">
            <span class="similarity-label">相似度:</span>
            <span :class="getSimilarityColorClass(previewResult.similarity)">
              {{ previewResult.similarity.toFixed(1) }}%
            </span>
          </div>
          <div class="score-info">
            <span class="score-label">分数:</span>
            <span>{{ previewResult.score.toFixed(4) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: {
    results: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      previewResult: null
    };
  },
  methods: {
    /**
     * 获取图片URL
     * @param {Object} result - 搜索结果对象
     * @returns {string} 图片URL
     */
    getImageUrl(result) {
      if (result.filePath.startsWith('http')) {
        return result.filePath;
      }
      
      // 处理文件路径，确保正确访问uploads目录
      let filePath = result.filePath;
      
      // 如果路径包含backend/uploads，提取文件名
      if (filePath.includes('backend/uploads/')) {
        const fileName = filePath.split('backend/uploads/')[1];
        return `http://localhost:3001/image/${fileName}`;
      }
      
      // 如果路径包含uploads/，提取文件名
      if (filePath.includes('uploads/')) {
        const fileName = filePath.split('uploads/')[1];
        return `http://localhost:3001/image/${fileName}`;
      }
      
      // 处理Windows绝对路径（如 D:/开发环境/测试识图搜图/...）
      if (filePath.includes(':/') || filePath.includes(':\\')) {
        // 对于绝对路径，使用新的路由处理
        const encodedPath = encodeURIComponent(filePath);
        return `http://localhost:3001/image-absolute/${encodedPath}`;
      }
      
      // 如果只是文件名，直接使用
      if (!filePath.startsWith('/')) {
        return `http://localhost:3001/image/${filePath}`;
      }
      
      // 默认情况：提取文件名
      const fileName = filePath.split(/[/\\]/).pop();
      return `http://localhost:3001/image/${fileName}`;
    },

    /**
     * 获取相似度等级
     * @param {number} similarity - 相似度百分比
     * @returns {string} 相似度等级
     */
    getSimilarityLevel(similarity) {
      if (similarity >= 90) return 'excellent';
      if (similarity >= 80) return 'very-good';
      if (similarity >= 70) return 'good';
      if (similarity >= 60) return 'fair';
      return 'poor';
    },

    /**
     * 获取相似度颜色类名
     * @param {number} similarity - 相似度百分比
     * @returns {string} 颜色类名
     */
    getSimilarityColorClass(similarity) {
      const level = this.getSimilarityLevel(similarity);
      const colorMap = {
        excellent: 'text-green-600',
        'very-good': 'text-green-500',
        good: 'text-yellow-500',
        fair: 'text-orange-500',
        poor: 'text-red-500'
      };
      return colorMap[level] || 'text-gray-500';
    },

    /**
     * 获取相似度徽章类名
     * @param {number} similarity - 相似度百分比
     * @returns {string} 徽章类名
     */
    getSimilarityClass(similarity) {
      const level = this.getSimilarityLevel(similarity);
      return `similarity-${level}`;
    },

    /**
     * 查看搜索结果
     * @param {Object} result - 搜索结果对象
     */
    viewResult(result) {
      this.previewResult = result;
    },

    /**
     * 关闭预览
     */
    closePreview() {
      this.previewResult = null;
    },

    /**
     * 清空搜索结果
     */
    clearResults() {
      this.$emit('clear');
    }
  }
};
</script>

<style scoped>
.search-results {
  margin-top: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.25rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #4b5563;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.125rem;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.result-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  transition: all 0.2s ease;
}

.result-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.result-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.result-item:hover .result-image {
  transform: scale(1.05);
}

.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.result-item:hover .result-overlay {
  opacity: 1;
}

.similarity-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.similarity-excellent {
  background-color: #10b981;
}

.similarity-very-good {
  background-color: #059669;
}

.similarity-good {
  background-color: #d97706;
}

.similarity-fair {
  background-color: #ea580c;
}

.similarity-poor {
  background-color: #dc2626;
}

.view-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #3b82f6;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background-color: #2563eb;
}

.result-info {
  padding: 1rem;
}

.result-rank {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.result-similarity {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.text-green-600 {
  color: #059669;
}

.text-green-500 {
  color: #10b981;
}

.text-yellow-500 {
  color: #d97706;
}

.text-orange-500 {
  color: #ea580c;
}

.text-red-500 {
  color: #dc2626;
}

.text-gray-500 {
  color: #6b7280;
}

.result-score {
  font-size: 0.75rem;
  color: #6b7280;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.modal-info {
  padding: 1rem;
  text-align: center;
}

.modal-info h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.125rem;
}

.similarity-info,
.score-info {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.similarity-label,
.score-label {
  font-weight: 500;
  color: #374151;
  margin-right: 0.5rem;
}
</style>
