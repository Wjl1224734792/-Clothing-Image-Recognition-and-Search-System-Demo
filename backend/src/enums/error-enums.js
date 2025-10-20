/**
 * 错误码枚举
 * 定义系统中使用的错误码
 */
export const NErrorCode = {
  // 成功
  Success: 200,
  
  // 客户端错误
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  Conflict: 409,
  ValidationError: 422,
  TooManyRequests: 429,
  
  // 服务器错误
  InternalError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  
  // 业务错误
  DatabaseError: 1001,
  FileNotFound: 1002,
  InvalidFileFormat: 1003,
  FileSizeExceeded: 1004,
  VectorDimensionMismatch: 1005,
  ModelLoadError: 1006,
  EmbeddingGenerationError: 1007,
  SearchError: 1008,
  InsertError: 1009,
  DeleteError: 1010
};

/**
 * 错误消息映射
 */
export const ERROR_MESSAGES = {
  [NErrorCode.BadRequest]: '请求参数错误',
  [NErrorCode.Unauthorized]: '未授权访问',
  [NErrorCode.Forbidden]: '禁止访问',
  [NErrorCode.NotFound]: '资源不存在',
  [NErrorCode.MethodNotAllowed]: '请求方法不允许',
  [NErrorCode.Conflict]: '资源冲突',
  [NErrorCode.ValidationError]: '数据验证失败',
  [NErrorCode.TooManyRequests]: '请求过于频繁',
  [NErrorCode.InternalError]: '服务器内部错误',
  [NErrorCode.NotImplemented]: '功能未实现',
  [NErrorCode.BadGateway]: '网关错误',
  [NErrorCode.ServiceUnavailable]: '服务不可用',
  [NErrorCode.GatewayTimeout]: '网关超时',
  [NErrorCode.DatabaseError]: '数据库操作失败',
  [NErrorCode.FileNotFound]: '文件不存在',
  [NErrorCode.InvalidFileFormat]: '文件格式无效',
  [NErrorCode.FileSizeExceeded]: '文件大小超出限制',
  [NErrorCode.VectorDimensionMismatch]: '向量维度不匹配',
  [NErrorCode.ModelLoadError]: '模型加载失败',
  [NErrorCode.EmbeddingGenerationError]: '嵌入向量生成失败',
  [NErrorCode.SearchError]: '搜索操作失败',
  [NErrorCode.InsertError]: '插入操作失败',
  [NErrorCode.DeleteError]: '删除操作失败'
};

/**
 * 获取错误消息
 * @param {number} errorCode - 错误码
 * @returns {string} 错误消息
 */
export const getErrorMessage = (errorCode) => {
  return ERROR_MESSAGES[errorCode] || '未知错误';
};
