import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../../config.js';

// ES模块兼容性处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 文件上传中间件配置
 */

// 文件存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // 生成安全的文件名，保持原始扩展名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const safeName = `${timestamp}_${randomStr}${ext}`;
    cb(null, safeName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (config.upload.allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    const error = new Error(`不支持的文件类型: ${fileExt}。支持的类型: ${config.upload.allowedExtensions.join(', ')}`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// 创建multer实例
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles
  }
});

/**
 * 单文件上传中间件
 * 用于单个图片上传
 */
export const uploadSingle = upload.single('image');

/**
 * 多文件上传中间件
 * 用于批量图片上传
 */
export const uploadMultiple = upload.array('images', config.upload.maxFiles);

/**
 * 字段上传中间件
 * 用于多个字段的文件上传
 */
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: config.upload.maxFiles }
]);

/**
 * 文件上传错误处理中间件
 * 专门处理multer相关的错误
 */
export const uploadErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: '文件大小超出限制',
          code: 400,
          details: {
            maxSize: config.upload.maxFileSize,
            receivedSize: error.field
          }
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: '文件数量超出限制',
          code: 400,
          details: {
            maxFiles: config.upload.maxFiles
          }
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: '不支持的文件类型',
          code: 400,
          details: {
            allowedTypes: config.upload.allowedExtensions
          }
        });
      
      default:
        return res.status(400).json({
          success: false,
          error: '文件上传失败',
          code: 400,
          details: {
            multerError: error.message
          }
        });
    }
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 400,
      details: {
        allowedTypes: config.upload.allowedExtensions
      }
    });
  }
  
  next(error);
};

/**
 * 文件验证中间件
 * 验证上传的文件是否符合要求
 */
export const validateUploadedFiles = (req, res, next) => {
  // 检查是否有文件上传
  if (!req.file && (!req.files || req.files.length === 0)) {
    return res.status(400).json({
      success: false,
      error: '请选择要上传的文件',
      code: 400
    });
  }

  // 验证单文件上传
  if (req.file) {
    const file = req.file;
    
    // 检查文件大小
    if (file.size > config.upload.maxFileSize) {
      return res.status(400).json({
        success: false,
        error: '文件大小超出限制',
        code: 400,
        details: {
          maxSize: config.upload.maxFileSize,
          receivedSize: file.size
        }
      });
    }
  }

  // 验证多文件上传
  if (req.files && req.files.length > 0) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    // 检查文件数量
    if (files.length > config.upload.maxFiles) {
      return res.status(400).json({
        success: false,
        error: '文件数量超出限制',
        code: 400,
        details: {
          maxFiles: config.upload.maxFiles,
          receivedCount: files.length
        }
      });
    }

    // 检查每个文件的大小
    for (const file of files) {
      if (file.size > config.upload.maxFileSize) {
        return res.status(400).json({
          success: false,
          error: `文件 ${file.originalname} 大小超出限制`,
          code: 400,
          details: {
            maxSize: config.upload.maxFileSize,
            receivedSize: file.size,
            fileName: file.originalname
          }
        });
      }
    }
  }

  next();
};
