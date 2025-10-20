/**
 * 响应工具类
 * 提供统一的API响应格式
 */

/**
 * 构建成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} code - 响应码
 * @returns {Object} 成功响应对象
 */
export const buildSuccessResponse = (data, message = 'Success', code = 200) => ({
  success: true,
  data,
  message,
  code,
  timestamp: new Date().toISOString()
});

/**
 * 构建错误响应
 * @param {string} error - 错误消息
 * @param {number} code - 错误码
 * @param {any} details - 错误详情
 * @returns {Object} 错误响应对象
 */
export const buildErrorResponse = (error, code = 500, details = null) => ({
  success: false,
  error,
  code,
  details,
  timestamp: new Date().toISOString()
});

/**
 * 构建分页响应
 * @param {any} data - 响应数据
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 * @param {number} total - 总数量
 * @param {string} message - 响应消息
 * @returns {Object} 分页响应对象
 */
export const buildPaginatedResponse = (data, page, limit, total, message = 'Success') => ({
  success: true,
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / limit)
  },
  message,
  timestamp: new Date().toISOString()
});

/**
 * 构建验证错误响应
 * @param {Array<string>} errors - 验证错误列表
 * @returns {Object} 验证错误响应对象
 */
export const buildValidationErrorResponse = (errors) => ({
  success: false,
  error: 'Validation failed',
  code: 422,
  details: {
    validation_errors: errors
  },
  timestamp: new Date().toISOString()
});

/**
 * 构建未找到响应
 * @param {string} resource - 资源名称
 * @returns {Object} 未找到响应对象
 */
export const buildNotFoundResponse = (resource = 'Resource') => ({
  success: false,
  error: `${resource} not found`,
  code: 404,
  timestamp: new Date().toISOString()
});

/**
 * 构建未授权响应
 * @param {string} message - 错误消息
 * @returns {Object} 未授权响应对象
 */
export const buildUnauthorizedResponse = (message = 'Unauthorized') => ({
  success: false,
  error: message,
  code: 401,
  timestamp: new Date().toISOString()
});

/**
 * 构建禁止访问响应
 * @param {string} message - 错误消息
 * @returns {Object} 禁止访问响应对象
 */
export const buildForbiddenResponse = (message = 'Forbidden') => ({
  success: false,
  error: message,
  code: 403,
  timestamp: new Date().toISOString()
});
