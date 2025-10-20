# ImageFeatureExtractionPipeline 图像特征提取管道API详解

## 🎯 核心功能

这是一个专门用于从图像中提取特征向量的管道API，可以将图像转换为数值化的特征表示，用于下游任务（如相似度搜索、分类等）。

## 📋 接口参数说明

### 输入参数

```javascript
/**
 * @param {ImagePipelineInputs} images - 输入图像（支持多种格式）
 * @param {Object} [options] - 可选参数
 * @param {boolean} [options.pool=null] - 是否返回池化输出
 */
```

### 图像输入格式支持

- **URL字符串**（在线图片）
- **RawImage**（原始图像数据）
- **Blob对象**
- **HTMLCanvasElement**
- **OffscreenCanvas**

### pool参数详解

```javascript
pool = null  // 默认值：不进行池化，返回原始隐藏状态
pool = true   // 启用池化，返回汇总后的特征
pool = false  // 明确禁用池化
```

## 🔧 内部处理流程

### 1. 图像预处理

```javascript
const preparedImages = await prepareImages(images);
const { pixel_values } = await this.processor(preparedImages);
```

- 将各种格式的图像统一转换为模型可处理的像素值
- 进行标准化、缩放等预处理操作

### 2. 模型推理

```javascript
const outputs = await this.model({ pixel_values });
```

- 使用预训练模型进行前向传播
- 得到模型的原始输出

### 3. 输出选择逻辑

```javascript
if (pool) {
    // 使用池化输出（如果模型支持）
    result = outputs.pooler_output;
} else {
    // 使用原始隐藏状态或嵌入向量
    result = outputs.last_hidden_state ?? outputs.logits ?? outputs.image_embeds;
}
```

## 📊 输出特征维度对比

### 不同模型的输出差异

#### ViT模型示例（无池化）

```javascript
// 输出形状：[1, 197, 768]
// 含义：1张图片 × 197个图像块 × 每个块768维特征
```

- **197个图像块**：ViT将图像分割成多个小块分别处理
- **768维特征**：每个图像块的详细特征表示

#### CLIP模型示例（自动池化）

```javascript
// 输出形状：[1, 512]
// 含义：1张图片 × 512维全局特征向量
```

- **512维向量**：整个图像的汇总特征
- **适合相似度计算**：直接可用于向量检索

## 💡 使用场景建议

### 使用池化（pool=true）的情况

- **图像检索系统**：需要单个向量表示
- **相似度计算**：直接比较图像相似性
- **分类任务**：作为分类器输入特征

### 不使用池化（pool=false/null）的情况

- **细粒度分析**：需要每个图像块的详细信息
- **目标检测**：需要空间位置信息
- **自定义池化**：希望自己实现池化策略

## ⚠️ 注意事项

### 模型兼容性

```javascript
if (!('pooler_output' in outputs)) {
    throw Error('模型没有池化层，无法使用pool选项');
}
```

- 只有具备池化层的模型才能使用 `pool=true`
- CLIP等对比学习模型通常支持池化
- 纯ViT模型可能不支持池化

### 性能考虑

- **池化输出**：特征维度小，计算效率高
- **原始输出**：包含更多信息但维度更大

## 🛠️ 实际使用示例

### 基础用法

```javascript
const extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
const features = await extractor('https://example.com/image.jpg');
// 得到512维特征向量，适合Milvus向量数据库存储
```

### 高级用法

```javascript
// 明确启用池化
const pooledFeatures = await extractor(imageUrl, { pool: true });

// 明确禁用池化（获取详细特征）
const detailedFeatures = await extractor(imageUrl, { pool: false });
```

---

这个API为图像特征提取提供了灵活的接口，特别适合构建图像检索系统和多模态应用！