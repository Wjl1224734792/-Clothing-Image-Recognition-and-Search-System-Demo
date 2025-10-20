<template>
  <div class="image-upload">
    <div class="upload-area" 
         :class="{ 'drag-over': isDragOver, 'uploading': uploading }"
         @dragover.prevent="handleDragOver"
         @dragleave.prevent="handleDragLeave"
         @drop.prevent="handleDrop"
         @click="triggerFileInput">
      
      <input ref="fileInput" 
             type="file" 
             multiple 
             accept="image/*" 
             @change="handleFileSelect"
             style="display: none;">
      
      <div v-if="!uploading" class="upload-content">
        <div class="upload-icon">📁</div>
        <h3>点击或拖拽上传图片</h3>
        <p>支持批量上传，单张图片不超过10MB，总大小不超过50MB</p>
        <div class="file-info">
          <span>支持格式: JPG, PNG, GIF, WebP</span>
        </div>
      </div>
      
      <div v-else class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p>上传中... {{ uploadProgress }}%</p>
      </div>
    </div>
    
    <!-- 文件预览 -->
    <div v-if="selectedFiles.length > 0" class="file-preview">
      <h4>选择的文件 ({{ selectedFiles.length }} 个)</h4>
      <div class="file-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <img :src="getFilePreview(file)" :alt="file.name" class="file-thumbnail">
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
          <button @click="removeFile(index)" class="remove-btn">×</button>
        </div>
      </div>
      
      <div class="upload-actions">
        <button @click="clearFiles" class="btn btn-secondary">清空</button>
        <button @click="uploadFiles" :disabled="uploading" class="btn btn-primary">
          {{ uploading ? '上传中...' : '开始上传' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  props: {
    uploading: {
      type: Boolean,
      default: false
    },
    uploadProgress: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedFiles: [],
      isDragOver: false
    };
  },
  methods: {
    /**
     * 触发文件选择
     */
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    /**
     * 处理文件选择
     * @param {Event} event - 文件选择事件
     */
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.addFiles(files);
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
      
      const files = Array.from(event.dataTransfer.files);
      this.addFiles(files);
    },

    /**
     * 添加文件到列表
     * @param {Array<File>} files - 文件列表
     */
    addFiles(files) {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        this.$emit('error', '请选择有效的图片文件');
        return;
      }

      // 验证文件大小
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const maxTotalSize = 50 * 1024 * 1024; // 50MB
      let totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);

      for (const file of imageFiles) {
        if (file.size > maxFileSize) {
          this.$emit('error', `文件 ${file.name} 大小超过10MB限制`);
          return;
        }
        
        totalSize += file.size;
        if (totalSize > maxTotalSize) {
          this.$emit('error', `总文件大小超过50MB限制`);
          return;
        }
      }

      this.selectedFiles.push(...imageFiles);
    },

    /**
     * 移除文件
     * @param {number} index - 文件索引
     */
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },

    /**
     * 清空文件列表
     */
    clearFiles() {
      this.selectedFiles = [];
      this.$refs.fileInput.value = '';
    },

    /**
     * 上传文件
     */
    uploadFiles() {
      if (this.selectedFiles.length === 0) {
        this.$emit('error', '请先选择要上传的文件');
        return;
      }

      this.$emit('upload', this.selectedFiles);
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
.image-upload {
  margin-bottom: 2rem;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.upload-area.uploading {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.upload-content h3 {
  margin: 0;
  color: #374151;
  font-size: 1.25rem;
}

.upload-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.file-info {
  font-size: 0.75rem;
  color: #9ca3af;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #10b981;
  transition: width 0.3s ease;
}

.file-preview {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
}

.file-preview h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  position: relative;
}

.file-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.upload-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}
</style>
