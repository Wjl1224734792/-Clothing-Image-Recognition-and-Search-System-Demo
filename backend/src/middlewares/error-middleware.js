import { buildErrorResponse, buildValidationErrorResponse } from '../utils/response-utils.js';
import { NErrorCode } from '../enums/error-enums.js';

/**
 * 全局错误处理中间件
 * 统一处理应用程序中的错误
 */
export const errorMiddleware = (error, req, res, next) => {
  console.error('🚨 全局错误处理:', error);

  // 处理Multer文件上传错误
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      buildErrorResponse('文件大小超出限制', NErrorCode.FileSizeExceeded)
    );
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json(
      buildErrorResponse('文件数量超出限制', NErrorCode.ValidationError)
    );
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json(
      buildErrorResponse('不支持的文件类型', NErrorCode.InvalidFileFormat)
    );
  }

  // 处理验证错误
  if (error.name === 'ValidationError') {
    const validationErrors = error.details?.map(detail => detail.message) || [error.message];
    return res.status(422).json(
      buildValidationErrorResponse(validationErrors)
    );
  }

  // 处理文件系统错误
  if (error.code === 'ENOENT') {
    return res.status(404).json(
      buildErrorResponse('文件不存在', NErrorCode.FileNotFound)
    );
  }

  if (error.code === 'EACCES') {
    return res.status(403).json(
      buildErrorResponse('文件访问权限不足', NErrorCode.Forbidden)
    );
  }

  // 处理数据库错误
  if (error.message?.includes('Milvus') || error.message?.includes('collection')) {
    return res.status(500).json(
      buildErrorResponse('数据库操作失败', NErrorCode.DatabaseError, {
        originalError: error.message
      })
    );
  }

  // 处理模型相关错误
  if (error.message?.includes('embedding') || error.message?.includes('vector')) {
    return res.status(500).json(
      buildErrorResponse('向量处理失败', NErrorCode.EmbeddingGenerationError, {
        originalError: error.message
      })
    );
  }

  // 处理网络错误
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json(
      buildErrorResponse('服务连接失败', NErrorCode.ServiceUnavailable, {
        originalError: error.message
      })
    );
  }

  // 处理超时错误
  if (error.code === 'ETIMEDOUT') {
    return res.status(504).json(
      buildErrorResponse('请求超时', NErrorCode.GatewayTimeout, {
        originalError: error.message
      })
    );
  }

  // 默认服务器错误
  const statusCode = error.statusCode || error.status || 500;
  const errorMessage = error.message || '服务器内部错误';
  
  res.status(statusCode).json(
    buildErrorResponse(errorMessage, statusCode, {
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  );
};

/**
 * 404错误处理中间件
 * 处理未找到的路由
 */
export const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`路由未找到: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * 异步错误捕获包装器
 * 用于包装异步路由处理器，自动捕获Promise错误
 * @param {Function} fn - 异步函数
 * @returns {Function} 包装后的函数
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
