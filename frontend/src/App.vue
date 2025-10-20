<template>
  <div id="app">
    <!-- 头部 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">🔍 服装图片识别与搜索系统</h1>
        <p class="app-subtitle">基于MVP架构的图片搜索与管理系统</p>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="app-main">
      <div class="container">
        <!-- 消息提示 -->
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <!-- 图片上传 -->
        <section class="upload-section">
          <h2>📤 图片上传</h2>
          <ImageUpload 
            :uploading="loading"
            :upload-progress="uploadProgress"
            @upload="handleUpload"
            @error="handleError" />
        </section>

        <!-- 图片搜索 -->
        <section class="search-section">
          <h2>🔍 图片搜索</h2>
          <ImageSearch 
            :searching="loading"
            @search-upload="handleSearchUpload"
            @search-url="handleSearchUrl"
            @search-blob="handleSearchBlob"
            @error="handleError" />
        </section>


        <!-- 搜索结果 -->
        <section v-if="searchResults.length > 0" class="results-section">
          <h2>📊 搜索结果</h2>
          <SearchResults 
            :results="searchResults"
            :loading="loading"
            @clear="handleClearResults" />
        </section>

      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2025 智能图片搜索系统 - MVP架构</p>
        <div class="tech-stack">
          <span>Vue 3</span>
          <span>•</span>
          <span>Vite</span>
          <span>•</span>
          <span>MVP架构</span>
          <span>•</span>
          <span>Milvus向量数据库</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ImagePresenter } from './presenters/ImagePresenter.js';
import ImageUpload from './components/ImageUpload.vue';
import ImageSearch from './components/ImageSearch.vue';
import SearchResults from './components/SearchResults.vue';

export default {
  name: 'App',
  components: {
    ImageUpload,
    ImageSearch,
    SearchResults
  },
  data() {
    return {
      // 展示器
      presenter: null,
      
      // 状态数据
      searchResults: [],
      loading: false,
      error: null,
      uploadProgress: 0,
      
      // 消息提示
      message: '',
      messageType: 'info'
    };
  },
  async mounted() {
    // 初始化展示器
    this.presenter = new ImagePresenter(this);
    await this.presenter.initialize();
  },
  methods: {
    // 视图接口实现
    updateLoading(loading) {
      this.loading = loading;
    },

    updateError(error) {
      this.error = error;
    },


    updateSearchResults(results) {
      this.searchResults = results;
    },

    updateUploadProgress(progress) {
      this.uploadProgress = progress;
    },


    showSuccess(message) {
      this.showMessage(message, 'success');
    },

    showError(message) {
      this.showMessage(message, 'error');
    },

    showWarning(message) {
      this.showMessage(message, 'warning');
    },

    showInfo(message) {
      this.showMessage(message, 'info');
    },

    showMessage(message, type) {
      this.message = message;
      this.messageType = type;
      
      // 3秒后自动隐藏消息
      setTimeout(() => {
        this.message = '';
      }, 3000);
    },

    // 事件处理
    async handleUpload(files) {
      await this.presenter.uploadImages(files);
    },

    async handleSearchUpload(file) {
      await this.presenter.searchByUpload(file);
    },

    async handleSearchUrl(url) {
      await this.presenter.searchByUrl(url);
    },

    async handleSearchBlob(blobData) {
      await this.presenter.searchByBlob(blobData);
    },


    handleClearResults() {
      this.presenter.clearSearchResults();
    },

    handleError(error) {
      this.showError(error);
    }
  }
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #374151;
  background-color: #f9fafb;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  font-weight: 300;
}

/* 主要内容样式 */
.app-main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 消息提示样式 */
.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.message.warning {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.message.info {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 区块样式 */
section {
  margin-bottom: 3rem;
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 页脚样式 */

.app-footer {
  background-color: #374151;
  color: #9ca3af;
  padding: 2rem 0;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.tech-stack {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.tech-stack span {
  padding: 0.25rem 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
  
  section {
    padding: 1.5rem;
  }
  
  .container {
    padding: 0 0.5rem;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.75rem;
  }
  
  section {
    padding: 1rem;
  }
}
</style>