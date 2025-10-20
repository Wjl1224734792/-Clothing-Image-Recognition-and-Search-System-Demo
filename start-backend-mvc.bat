@echo off
echo 🚀 启动MVC架构的图片搜索后端服务...
echo.
echo 📋 服务信息:
echo    - 架构: MVC (Model-View-Controller)
echo    - 端口: 3001
echo    - 向量数据库: Milvus
echo    - AI模型: Marqo/marqo-fashionSigLIP (768维)
echo    - 特征提取: 管道API
echo.
echo 🔧 启动命令: npm run dev
echo.

cd backend
npm run dev
