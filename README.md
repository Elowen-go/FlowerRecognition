# 🌸 美丽花卉识别系统

一个基于 PyTorch 的本地花卉识别 Web 应用，支持 102 类花卉识别。

---

## 📋 项目概述

- **技术栈**: React 18 + Vite + Flask + PyTorch (DenseNet-121)
- **识别方式**: 本地深度学习模型推理（离线可用）
- **支持类别**: 102 种花卉（Oxford 102 Flower 数据集）

---

## 🛠️ 环境要求

### 后端
- Python 3.10+
- PyTorch 2.1.0+
- Flask 3.0.0+

### 前端
- Node.js 18+
- npm 或 yarn

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <仓库地址>
cd FlowerRecognition
```

### 2. 准备模型文件

> **方式一：下载预训练模型（推荐）**
> 
> 下载链接：[flower_model.pth](https://example.com/flower_model.pth)（约 28.8MB）
> 
> 下载后放入 `backend/models/` 目录
> 
> > **注意：** 如果链接失效，请联系项目管理员获取最新下载地址
> 
> **方式二：使用 Git LFS（团队协作）**
> 
> 如果项目配置了 Git LFS，克隆时会自动下载模型：
> ```bash
> git lfs install
> git clone <仓库地址>
> ```
> 
> **方式三：重新训练模型**
> 
> 见下方「训练指南」

### 3. 启动后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py

# 服务运行在 http://localhost:5000
```

### 4. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 服务运行在 http://localhost:3000
```

---

## 📊 训练指南

### 准备数据集

下载 Oxford 102 Flower 数据集（推荐使用百度网盘，国内速度更快）：

- **百度网盘（推荐）**：[下载链接](https://pan.baidu.com/s/1aEJIyJs7rtZfMQpZQgC_6g)，提取码：`3o1q`
- **官方下载**：[Oxford 102 Flower Dataset](https://www.robots.ox.ac.uk/~vgg/data/flowers/102/)
- **Kaggle 镜像**：[102 Category Flower Dataset](https://www.kaggle.com/alxmamaev/flowers-recognition)

解压后放入 `backend/data/flower_data/`：

```
backend/data/flower_data/
├── train/
│   ├── 0/
│   ├── 1/
│   └── ...
└── valid/
    ├── 0/
    ├── 1/
    └── ...
```

### 运行训练

```bash
cd backend
python train_model.py
```

训练参数：
- 模型架构：DenseNet-121
- 训练轮数：15 epoch
- 批大小：64
- 学习率：0.001

训练完成后，模型会自动保存到 `models/flower_model.pth`。

---

## 🔄 切换识别模式

### 本地模型模式（默认）
```python
# app.py
from services.classifier import recognize_plant
```

### 百度AI API模式
```python
# app.py
from services.baidu_ai import recognize_plant
```

切换到百度API需要配置 `backend/config.py`：
```python
BAIDU_API_KEY = "你的API Key"
BAIDU_SECRET_KEY = "你的Secret Key"
```

---

## 📁 项目结构

```
FlowerRecognition/
├── backend/
│   ├── app.py                 # Flask 主入口
│   ├── train_model.py         # 模型训练脚本
│   ├── requirements.txt       # Python 依赖
│   ├── cat_to_name.json       # 类别映射
│   ├── flower_info.json       # 花卉百科
│   ├── models/
│   │   └── flower_model.pth   # 预训练模型
│   └── services/
│       ├── classifier.py      # 本地推理服务
│       ├── baidu_ai.py        # 百度API服务
│       └── flower_info.py     # 花卉信息查询
├── frontend/
│   ├── src/
│   │   ├── components/        # React 组件
│   │   ├── utils/             # 工具函数
│   │   └── App.jsx            # 主应用
│   └── package.json
└── README.md                  # 本文件
```

---

## 🐳 Docker 部署（可选）

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

## 📝 API 接口

### POST /api/recognize
识别花卉图片

**请求体：**
```json
{
    "image": "base64编码的图片数据"
}
```

**响应：**
```json
{
    "success": true,
    "data": {
        "name": "月季",
        "confidence": 0.95,
        "basic_intro": "...",
        "flower_language": "爱情、美丽",
        "latin_name": "Rosa chinensis",
        "family": "蔷薇科",
        "genus": "蔷薇属",
        "alias": ["月月红", "长春花"]
    }
}
```

### GET /api/health
健康检查

**响应：**
```json
{
    "status": "ok",
    "service": "美丽花卉识别系统",
    "version": "2.0.0"
}
```

---

## 💡 注意事项

1. **模型文件**: `flower_model.pth` 约 28.8MB，不包含在 Git 仓库中
2. **首次加载**: 模型首次加载可能需要几秒时间
3. **GPU 加速**: 如有 NVIDIA GPU 且安装了 CUDA，会自动使用 GPU
4. **图片限制**: 建议上传清晰的花卉图片，大小不超过 10MB

---

## 📄 许可证

MIT License