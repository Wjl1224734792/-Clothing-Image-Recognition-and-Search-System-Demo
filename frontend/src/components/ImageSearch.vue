<template>
  <div class="image-search">
    <div class="search-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <!-- 文件上传搜索 -->
    <div v-if="activeTab === 'upload'" class="search-content">
      <div class="search-upload-area" 
           :class="{ 'drag-over': isDragOver }"
           @dragover.prevent="handleDragOver"
           @dragleave.prevent="handleDragLeave"
           @drop.prevent="handleDrop"
           @click="triggerFileInput">
        
        <input ref="searchFileInput" 
               type="file" 
               accept="image/*" 
               @change="handleFileSelect"
               style="display: none;">
        
        <div class="search-upload-content">
          <div class="search-icon">🔍</div>
          <h3>选择要搜索的图片</h3>
          <p>点击或拖拽图片文件进行搜索</p>
        </div>
      </div>
      
      <div v-if="selectedFile" class="selected-file">
        <img :src="getFilePreview(selectedFile)" :alt="selectedFile.name" class="file-preview">
        <div class="file-info">
          <div class="file-name">{{ selectedFile.name }}</div>
          <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
        </div>
        <button @click="clearSelectedFile" class="clear-btn">×</button>
      </div>
    </div>

    <!-- URL搜索 -->
    <div v-if="activeTab === 'url'" class="search-content">
      <div class="url-input-group">
        <input 
          v-model="imageUrl" 
          type="url" 
          placeholder="请输入图片URL"
          class="url-input">
        <button @click="searchByUrl" :disabled="!imageUrl || searching" class="search-btn">
          {{ searching ? '搜索中...' : '搜索' }}
        </button>
      </div>
    </div>

    <!-- 选择图片转Blob搜索 -->
    <div v-if="activeTab === 'data'" class="search-content">
      <div class="data-upload-area" 
           :class="{ 'drag-over': isDataDragOver }"
           @dragover.prevent="handleDataDragOver"
           @dragleave.prevent="handleDataDragLeave"
           @drop.prevent="handleDataDrop"
           @click="triggerDataFileInput">
        
        <input ref="dataFileInput" 
               type="file" 
               accept="image/*" 
               @change="handleDataFileSelect"
               style="display: none;">
        
        <div class="data-upload-content">
          <div class="data-icon">📁</div>
          <h3>选择图片文件</h3>
          <p>点击或拖拽图片文件，将自动转换为Blob格式进行搜索</p>
        </div>
      </div>
      
      <div v-if="selectedDataFile" class="selected-data-file">
        <img :src="getFilePreview(selectedDataFile)" :alt="selectedDataFile.name" class="data-file-preview">
        <div class="data-file-info">
          <div class="data-file-name">{{ selectedDataFile.name }}</div>
          <div class="data-file-size">{{ formatFileSize(selectedDataFile.size) }}</div>
        </div>
        <button @click="clearSelectedDataFile" class="data-clear-btn">×</button>
      </div>
    </div>

    <!-- 搜索按钮 -->
    <div v-if="activeTab === 'upload' && selectedFile" class="search-actions">
      <button @click="searchByUpload" :disabled="searching" class="search-btn">
        {{ searching ? '搜索中...' : '开始搜索' }}
      </button>
    </div>
    
    <div v-if="activeTab === 'data' && selectedDataFile" class="search-actions">
      <button @click="searchByData" :disabled="searching" class="search-btn">
        {{ searching ? '搜索中...' : '开始搜索' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSearch',
  props: {
    searching: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: 'upload',
      selectedFile: null,
      selectedDataFile: null,
      imageUrl: '',
      isDragOver: false,
      isDataDragOver: false,
      tabs: [
        { id: 'upload', label: '上传图片' },
        { id: 'url', label: '图片URL' },
        { id: 'data', label: '选择图片转Blob' }
      ]
    };
  },
  methods: {
    /**
     * 触发文件选择
     */
    triggerFileInput() {
      this.$refs.searchFileInput.click();
    },

    /**
     * 处理文件选择
     * @param {Event} event - 文件选择事件
     */
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.selectedFile = file;
      } else {
        this.$emit('error', '请选择有效的图片文件');
      }
    },

    /**
     * 处理拖拽悬停
     * @param {Event} event - 拖拽事件
     */
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },

    /**
     * 处理拖拽离开
     * @param {Event} event - 拖拽事件
     */
    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },

    /**
     * 处理文件拖拽放置
     * @param {Event} event - 拖拽事件
     */
    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.selectedFile = file;
      } else {
        this.$emit('error', '请选择有效的图片文件');
      }
    },

    /**
     * 清空选择的文件
     */
    clearSelectedFile() {
      this.selectedFile = null;
      this.$refs.searchFileInput.value = '';
    },

    /**
     * 通过文件上传搜索
     */
    searchByUpload() {
      if (!this.selectedFile) {
        this.$emit('error', '请先选择要搜索的图片');
        return;
      }

      this.$emit('search-upload', this.selectedFile);
    },

    /**
     * 通过URL搜索
     */
    searchByUrl() {
      if (!this.imageUrl) {
        this.$emit('error', '请输入图片URL');
        return;
      }

      this.$emit('search-url', this.imageUrl);
    },

    /**
     * 触发数据文件选择
     */
    triggerDataFileInput() {
      this.$refs.dataFileInput.click();
    },

    /**
     * 处理数据文件选择
     * @param {Event} event - 文件选择事件
     */
    handleDataFileSelect(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.selectedDataFile = file;
      } else {
        this.$emit('error', '请选择有效的图片文件');
      }
    },

    /**
     * 处理数据文件拖拽悬停
     * @param {Event} event - 拖拽事件
     */
    handleDataDragOver(event) {
      event.preventDefault();
      this.isDataDragOver = true;
    },

    /**
     * 处理数据文件拖拽离开
     * @param {Event} event - 拖拽事件
     */
    handleDataDragLeave(event) {
      event.preventDefault();
      this.isDataDragOver = false;
    },

    /**
     * 处理数据文件拖拽放置
     * @param {Event} event - 拖拽事件
     */
    handleDataDrop(event) {
      event.preventDefault();
      this.isDataDragOver = false;
      
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.selectedDataFile = file;
      } else {
        this.$emit('error', '请选择有效的图片文件');
      }
    },

    /**
     * 清空选择的数据文件
     */
    clearSelectedDataFile() {
      this.selectedDataFile = null;
      this.$refs.dataFileInput.value = '';
    },

    /**
     * 通过数据文件搜索（转换为Blob）
     */
    async searchByData() {
      if (!this.selectedDataFile) {
        this.$emit('error', '请先选择要搜索的图片');
        return;
      }

      try {
        // 将文件转换为Blob
        const blobData = await this.fileToBlob(this.selectedDataFile);
        this.$emit('search-blob', blobData);
      } catch (error) {
        this.$emit('error', '文件转换失败: ' + error.message);
      }
    },

    /**
     * 将文件转换为Blob
     * @param {File} file - 文件对象
     * @returns {Promise<string>} Blob字符串
     */
    fileToBlob(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    /**
     * 获取文件预览
     * @param {File} file - 文件对象
     * @returns {string} 预览URL
     */
    getFilePreview(file) {
      return URL.createObjectURL(file);
    },

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
  }
};
</script>

<style scoped>
.image-search {
  margin-bottom: 2rem;
}

.search-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #374151;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.search-content {
  margin-bottom: 1.5rem;
}

.search-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.search-upload-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.search-upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.search-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.search-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.search-upload-content h3 {
  margin: 0;
  color: #374151;
  font-size: 1.25rem;
}

.search-upload-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  margin-top: 1rem;
  position: relative;
}

.file-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.clear-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: #ef4444;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background-color: #dc2626;
}

.url-input-group,
.data-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.url-input,
.data-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.url-input:focus,
.data-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.data-input {
  resize: vertical;
  min-height: 100px;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.search-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.search-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

/* 数据文件上传区域样式 */
.data-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.data-upload-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.data-upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.data-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.data-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.data-upload-content h3 {
  margin: 0;
  color: #374151;
  font-size: 1.25rem;
}

.data-upload-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.selected-data-file {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  margin-top: 1rem;
  position: relative;
}

.data-file-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.data-file-info {
  flex: 1;
}

.data-file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.data-file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.data-clear-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: #ef4444;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-clear-btn:hover {
  background-color: #dc2626;
}
</style>
