<br />

***

# 美丽花卉识别系统 - 完整开发文档

## 一、项目概述

### 1.1 项目名称

美丽花卉识别系统（Flower Recognition System）

### 1.2 项目描述

一个简洁清新的Web端花卉识别应用。用户可以上传花卉照片，系统使用本地训练的深度学习模型进行识别，并从本地花卉百科数据库获取详细信息（基本介绍、花语等），展示识别结果，同时在前端本地存储最近10条识别历史。

### 1.3 技术栈

| 层级    | 技术                      |
| ----- | ----------------------- |
| 前端框架  | React 18 + Vite         |
| CSS框架 | Tailwind CSS            |
| 后端框架  | Python 3.12+ + Flask    |
| 跨域处理  | Flask-CORS              |
| 深度学习框架 | PyTorch + torchvision   |
| 模型架构  | DenseNet-121（预训练微调） |
| 花卉百科  | 本地JSON数据库           |
| 数据存储  | 前端localStorage（10条历史记录） |

### 1.4 版本变更记录

| 版本 | 变更内容 | 时间 |
| ---- | ------- | ---- |
| v1.0.0 | 使用百度AI植物识别API + 花伴侣API | 初始版本 |
| v2.0.0 | **迁移到本地PyTorch深度学习模型**，支持离线识别 | 2026/05 |

***

## 二、项目结构

```
flower-recognition/
├── backend/
│   ├── app.py                    # Flask主入口
│   ├── train_model.py            # 模型训练脚本
│   ├── requirements.txt          # Python依赖
│   ├── cat_to_name.json          # 类别ID到花名映射
│   ├── flower_info.json          # 花卉百科数据库
│   ├── models/
│   │   └── flower_model.pth      # 训练好的DenseNet-121模型
│   └── services/
│       ├── __init__.py
│       ├── classifier.py         # 本地模型推理服务
│       ├── baidu_ai.py           # （已废弃）百度AI植物识别服务
│       └── flower_info.py        # 花卉详细信息查询服务（本地JSON）
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── favicon.svg           # 花卉icon
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css             # Tailwind指令 + 自定义样式
│       ├── components/
│       │   ├── Header.jsx        # 顶部导航栏
│       │   ├── UploadArea.jsx    # 图片上传区域
│       │   ├── ResultCard.jsx    # 识别结果展示卡片
│       │   ├── HistoryList.jsx   # 最近10条历史记录
│       │   └── LoadingSpinner.jsx # 加载动画
│       ├── utils/
│       │   ├── api.js            # 后端API调用封装
│       │   └── storage.js        # localStorage操作封装
│       └── assets/
│           └── flower-bg.svg     # 装饰性花卉背景图
```

***

## 三、后端开发详细说明

### 3.1 requirements.txt

```
flask==3.0.0
flask-cors==4.0.0
requests==2.31.0
python-dotenv==1.0.0
Pillow==10.1.0
torch==2.1.0
torchvision==0.16.0
```

### 3.2 模型文件说明

**flower_model.pth** - 训练好的花卉识别模型：
- 基于 DenseNet-121 架构
- 使用 Oxford 102 Flower 数据集微调
- 支持 102 类花卉识别
- 文件大小约 28.8 MB
- 保存在 `backend/models/` 目录

### 3.3 cat_to_name.json

类别ID到中文花名的映射文件，格式：

```json
{
    "0": "毛茛",
    "1": "铃兰",
    "2": "风铃草",
    ...
}
```

### 3.4 flower_info.json

花卉百科数据库，包含详细信息：

```json
{
    "月季": {
        "basic_intro": "月季被称为花中皇后，是常绿或半常绿低矮灌木",
        "detail_intro": "月季原产于中国，已有千年以上的栽培历史...",
        "flower_language": "爱情、美丽、勇气",
        "latin_name": "Rosa chinensis",
        "family": "蔷薇科",
        "genus": "蔷薇属",
        "alias": ["月月红", "长春花"]
    }
}
```

### 3.5 services/__init__.py

```python
# 空文件，让services成为一个Python包
```

### 3.6 services/classifier.py

**功能：** 本地深度学习模型推理服务

**核心流程：**

1. 加载预训练的 DenseNet-121 模型，替换分类头为 102 类输出
2. 加载训练好的权重文件 `flower_model.pth`
3. 提供 `recognize_plant(image_base64)` 方法：
   - 接收图片的 base64 编码字符串
   - 预处理图片（Resize → CenterCrop → Normalize）
   - 执行模型推理，使用 Softmax 获取置信度
   - 返回识别结果（花名、置信度）

**返回数据结构：**

```python
{
    "success": True,
    "data": {
        "name": "月季",
        "score": 0.95,
        "baike_description": ""
    }
}
```

**关键实现细节：**

- 模型仅在首次调用时加载，后续请求复用已加载的模型（单例模式）
- 使用 `torch.no_grad()` 禁用梯度计算，提升推理速度
- 支持 GPU（CUDA）和 CPU 推理自动切换

### 3.7 services/flower_info.py

**功能：** 根据花名查询详细信息（从本地JSON数据库）

**核心流程：**

1. 提供 `get_flower_detail(name)` 方法
2. 从 `flower_info.json` 加载花卉百科数据
3. 根据花名查找对应的详细信息
4. 如果找到，返回完整的花卉信息；否则返回基本结构

**返回数据结构：**

```python
{
    "success": True,
    "data": {
        "name": "月季",
        "latin_name": "Rosa chinensis",
        "family": "蔷薇科",
        "genus": "蔷薇属",
        "alias": ["月月红", "长春花"],
        "basic_intro": "月季被称为花中皇后...",
        "detail_intro": "",
        "flower_language": "爱情、美丽、勇气",
        "images": []
    }
}
```

### 3.8 services/baidu_ai.py（已废弃）

> **注意：** 此文件为旧版本使用，当前版本已改用本地模型。

### 3.9 train_model.py

**功能：** 模型训练脚本

**训练流程：**

1. **数据准备：** 使用 Oxford 102 Flower 数据集，分为训练集和验证集
2. **数据增强：** 训练集使用随机裁剪、水平翻转、旋转等增强策略
3. **模型构建：** 加载预训练的 DenseNet-121，冻结主干网络，替换分类头
4. **训练配置：**
   - 优化器：Adam（仅训练分类头）
   - 学习率：0.001
   - 学习率调度：每5个epoch衰减为原来的0.1
   - 批大小：64
   - 训练轮数：15 epoch
5. **模型保存：** 保存验证准确率最高的模型

**关键参数：**

| 参数 | 值 | 说明 |
| ---- | --- | ---- |
| 输入尺寸 | 224×224 | DenseNet要求的输入大小 |
| 类别数 | 102 | Oxford 102 Flower 数据集 |
| 预训练权重 | ImageNet | 使用预训练模型迁移学习 |

### 3.10 app.py

**功能：** Flask主应用，处理前端请求

**路由设计：**

| 路由               | 方法   | 功能   | 请求体                      | 返回                 |
| ---------------- | ---- | ---- | ------------------------ | ------------------ |
| `/api/recognize` | POST | 花卉识别 | `{"image": "base64字符串"}` | 识别结果JSON           |
| `/api/health`    | GET  | 健康检查 | 无                        | `{"status": "ok"}` |

**`/api/recognize`** **接口详细设计：**

请求体格式：

```json
{
    "image": "/9j/4AAQSkZJRgABAQEASABIAAD/2wBD..."
}
```

处理流程：

1. 接收JSON请求体，提取 `image` 字段（base64字符串，不含前缀）
2. 调用 `classifier.recognize_plant()` 进行本地模型推理
3. 如果识别成功，提取花名，调用 `flower_info.get_flower_detail()` 获取详细信息
4. 整合两个结果，返回统一格式JSON
5. 全程不保存图片到磁盘，只在内存中处理

成功返回格式：

```json
{
    "success": true,
    "data": {
        "name": "月季",
        "confidence": 0.95,
        "basic_intro": "月季被称为花中皇后，是常绿或半常绿低矮灌木...",
        "detail_intro": "",
        "flower_language": "爱情、美丽、勇气",
        "latin_name": "Rosa chinensis",
        "family": "蔷薇科",
        "genus": "蔷薇属",
        "alias": ["月月红", "长春花"],
        "images": []
    }
}
```

失败返回格式：

```json
{
    "success": false,
    "error": "模型文件不存在，请先运行 train_model.py 训练模型",
    "detail": "具体错误描述"
}
```

**Flask应用配置：**

- 启用CORS，允许所有来源（开发环境）
- 请求体大小限制设置为10MB
- 使用 `app.json.ensure_ascii = False` 确保中文正常返回

**启动方式：**

```bash
cd backend
python app.py
# 默认运行在 http://localhost:5000
```

***

## 四、前端开发详细说明

### 4.1 项目初始化

使用Vite创建React项目：

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install axios
```

### 4.2 vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

> **重要：** Vite配置了代理，前端请求 `/api/xxx` 会自动转发到Flask后端 `http://localhost:5000/api/xxx`，避免跨域问题。

### 4.3 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        floral: {
          pink: '#f9a8d4',
          rose: '#f43f5e',
          lavender: '#c4b5fd',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
```

### 4.4 index.css

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

/* 自定义全局样式 */
body {
  font-family: 'Noto Sans SC', sans-serif;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf2f8 50%, #f5f3ff 100%);
  min-height: 100vh;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
```

### 4.5 index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>美丽花卉识别</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 4.6 src/utils/api.js

**功能：** 封装后端API调用

```javascript
import axios from 'axios';

const API_BASE = '/api';

/**
 * 识别花卉图片
 * @param {string} imageBase64 - 图片的base64字符串（不含前缀）
 * @returns {Promise} 识别结果
 */
export async function recognizeFlower(imageBase64) {
    const response = await axios.post(`${API_BASE}/recognize`, {
        image: imageBase64
    });
    return response.data;
}

/**
 * 健康检查
 */
export async function healthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
}
```

### 4.7 src/utils/storage.js

**功能：** 封装localStorage操作，管理最近10条识别历史

```javascript
const STORAGE_KEY = 'flower_recognition_history';
const MAX_HISTORY = 10;

/**
 * 获取所有历史记录
 */
export function getHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * 添加一条历史记录（自动维护最大10条，新的在前）
 * @param {object} record - { name, confidence, basic_intro, timestamp, thumbnail }
 */
export function addHistory(record) {
    const history = getHistory();
    // 添加到数组头部
    history.unshift({
        ...record,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    // 只保留最近10条
    if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return history;
}

/**
 * 清空历史记录
 */
export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}
```

### 4.8 src/main.jsx

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 4.9 src/App.jsx

**功能：** 应用主组件，管理全局状态

**状态设计：**

```javascript
const [result, setResult] = useState(null);      // 当前识别结果
const [history, setHistory] = useState([]);       // 历史记录
const [isLoading, setIsLoading] = useState(false); // 加载状态
const [previewImage, setPreviewImage] = useState(null); // 上传图片预览
```

**组件初始化：**

- `useEffect` 在组件挂载时调用 `getHistory()` 加载本地历史

**核心处理函数** **`handleImageUpload(file)`:**

1. 使用 `FileReader` 将图片文件转为base64
2. 将图片压缩至宽度不超过800px（减少传输数据量）
3. 设置 `previewImage` 显示预览
4. 设置 `isLoading = true`
5. 调用 `recognizeFlower(base64Data)` 发送到后端
6. 收到结果后：
   - 设置 `result`
   - 生成缩略图（100×100）用于历史记录
   - 调用 `addHistory()` 保存
   - 刷新 `history` 状态
7. 无论成功失败，设置 `isLoading = false`
8. 出错时设置 `result` 为错误状态

**页面布局：**

- 整体采用居中布局，最大宽度 `max-w-4xl`，水平居中
- 顶部：Header组件
- 中部左侧（主区域）：UploadArea组件 + ResultCard组件
- 中部右侧（侧边栏）：HistoryList组件（桌面端显示，移动端放到下面）
- 使用Tailwind的响应式网格：`grid grid-cols-1 lg:grid-cols-3 gap-6`

### 4.10 src/components/Header.jsx

**设计要求：**

- 顶部固定栏，白色半透明背景 + 毛玻璃效果（`backdrop-blur-md bg-white/70`）
- 左侧：花卉emoji图标 🌸 + "美丽花卉识别" 标题（渐变色文字）
- 右侧：识别次数统计（从历史记录数量获取）
- 底部边框：`border-b border-gray-100`

**样式要点：**

```jsx
<header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-100">
    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-floral-rose bg-clip-text text-transparent">
            🌸 美丽花卉识别
        </h1>
        <span className="text-sm text-gray-500">
            已识别 {count} 次
        </span>
    </div>
</header>
```

### 4.11 src/components/UploadArea.jsx

**设计要求：**

- 一个大的虚线边框区域，圆角2xl
- 默认状态：中间显示花卉图标 + "点击或拖拽上传花卉图片" 文字 + "支持 JPG/PNG，建议图片清晰" 副文字
- 有预览图片时：显示图片预览（圆角，最大高度300px）+ 右下角"重新选择"按钮
- 拖拽状态时：边框变为绿色实线，背景变为浅绿色
- 点击触发隐藏的 `<input type="file" accept="image/*">`

**交互细节：**

- 支持点击选择和拖拽上传两种方式
- 拖拽时使用 `onDragOver` / `onDragLeave` / `onDrop` 事件
- 文件类型校验：只接受 `image/jpeg` 和 `image/png`
- 文件大小限制：前端限制10MB，超出弹出提示
- 压缩图片：使用Canvas将图片等比缩放至宽度800px，质量0.8

**组件Props：**

```javascript
{
    onImageSelect: Function,  // 图片选择后的回调，传递压缩后的base64
    preview: string|null,     // 当前预览图片的base64
    disabled: boolean         // 识别中时禁用上传
}
```

### 4.12 src/components/LoadingSpinner.jsx

**设计要求：**

- 识别过程中显示，替代ResultCard位置
- 中心一个旋转的花卉SVG图标或圆环动画
- 下方显示"正在识别中..."文字，文字有脉冲动画
- 使用Tailwind的 `animate-spin` 和自定义 `animate-pulse`

**代码结构：**

```jsx
<div className="flex flex-col items-center justify-center py-16">
    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 animate-pulse">正在识别中...</p>
</div>
```

### 4.13 src/components/ResultCard.jsx

**设计要求（核心组件，要好看）：**

- 白色卡片，大圆角（`rounded-2xl`），柔和阴影（`shadow-soft-lg`）
- 有结果时展示，无结果时不渲染

**卡片内容结构（从上到下）：**

1. **成功识别头部：**
   - 左侧：花卉emoji图标（大号）
   - 右侧：花名（大号字体，`text-3xl font-bold`）+ 置信度进度条
2. **置信度展示：**
   - 一个细长的进度条（`h-1.5 rounded-full`）
   - 填充色根据置信度变化：>0.8绿色、>0.6黄色、<0.6橙色
   - 右侧显示百分比数字
3. **拉丁学名 & 科属标签：**
   - 用圆角小标签展示（`inline-block px-3 py-1 rounded-full text-xs font-medium`）
   - 如"蔷薇科"、"蔷薇属"、"Rosa chinensis"
4. **基本介绍：**
   - 小标题"📖 基本介绍" + 段落文字
   - 文字行高舒适（`leading-relaxed`），颜色 `text-gray-600`
5. **花语展示：**
   - 小标题"💐 花语" + 花语内容
6. **别名展示：**
   - 小标题"📝 别名" + 别名列表
7. **失败状态：**
   - 显示红色边框卡片
   - "识别失败"标题 + 错误描述 + "请重新上传清晰的图片"提示

**组件Props：**

```javascript
{
    result: {
        success: true/false,
        data: {
            name, confidence, basic_intro, detail_intro,
            latin_name, family, genus, alias, flower_language, images
        }
    } | null
}
```

### 4.14 src/components/HistoryList.jsx

**设计要求：**

- 卡片容器，标题"📋 识别历史"
- 如果无历史：显示空状态（花卉图标 + "暂无识别记录"）
- 如果有历史：垂直列表，每条记录是一个可点击的小卡片

**每条历史记录展示：**

- 左侧：小缩略图（40×40px，圆角），没有缩略图则显示默认花卉图标
- 右侧上方：花名（`font-medium`）
- 右侧下方：识别时间（`text-xs text-gray-400`），格式化为"刚刚"、"5分钟前"、"1小时前"等相对时间
- 右侧末尾：置信度小标签（`text-xs`）
- hover效果：背景微变，鼠标变为手型

**点击历史记录：**

- 将该条记录重新加载到ResultCard展示
- 不需要重新请求API，直接使用历史记录中缓存的数据

**清空按钮：**

- 列表底部有"清空历史"文字按钮（`text-sm text-gray-400 hover:text-red-500`）
- 点击弹出确认提示，确认后清空

**组件Props：**

```javascript
{
    history: Array,            // 历史记录数组
    onSelect: Function,        // 选中某条历史记录的回调
    onClear: Function          // 清空历史的回调
}
```

### 4.15 时间格式化工具函数

在 `HistoryList.jsx` 中实现 `formatTime(isoString)` 函数：

```javascript
function formatTime(isoString) {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return new Date(isoString).toLocaleDateString('zh-CN');
}
```

***

## 五、API接口完整规范

### 5.1 花卉识别接口

**POST /api/recognize**

请求：

```json
{
    "image": "base64编码的图片数据（不含data:image前缀）"
}
```

成功响应 (200)：

```json
{
    "success": true,
    "data": {
        "name": "月季",
        "confidence": 0.95,
        "basic_intro": "月季花是蔷薇科蔷薇属的常绿或半常绿低矮灌木...",
        "detail_intro": "",
        "flower_language": "爱情、美丽、勇气",
        "latin_name": "Rosa chinensis",
        "family": "蔷薇科",
        "genus": "蔷薇属",
        "alias": ["月月红", "长春花"],
        "images": []
    }
}
```

失败响应 (200，业务失败)：

```json
{
    "success": false,
    "error": "模型文件不存在，请先运行 train_model.py 训练模型"
}
```

服务端错误 (500)：

```json
{
    "success": false,
    "error": "服务器内部错误，请稍后重试",
    "detail": "具体错误描述"
}
```

### 5.2 健康检查接口

**GET /api/health**

响应：

```json
{
    "status": "ok",
    "service": "美丽花卉识别系统",
    "version": "2.0.0"
}
```

***

## 六、启动运行指南

### 6.1 模型准备

#### 方式一：使用已训练的模型

确保 `backend/models/flower_model.pth` 文件存在，该文件已在 2026/05/28 训练完成。

#### 方式二：重新训练模型

```bash
cd backend

# 确保已安装依赖
pip install -r requirements.txt

# 运行训练脚本（需要准备 Oxford 102 Flower 数据集）
python train_model.py

# 训练完成后模型会自动保存到 models/flower_model.pth
```

> **注意：** 训练需要 Oxford 102 Flower 数据集，应放置在 `backend/data/flower_data/` 目录下，包含 `train/` 和 `valid/` 子目录。

### 6.2 后端启动

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 启动服务（确保模型文件已存在）
python app.py

# 服务运行在 http://localhost:5000
```

### 6.3 前端启动

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 服务运行在 http://localhost:3000
```

***

## 七、关键注意事项

1. **图片压缩：** 前端上传前必须压缩图片（宽度不超过800px），减少传输时间和后端处理压力
2. **base64格式：** 发送给后端的base64字符串必须去掉 `data:image/xxx;base64,` 前缀
3. **模型加载：** 后端模型仅在首次请求时加载，后续请求复用，提升响应速度
4. **图片不存储：** 整个流程中图片只在内存处理，识别完成后立即清除，不落盘
5. **历史记录缩略图：** localStorage空间有限，历史记录中的缩略图必须压缩到100×100像素以内
6. **错误处理：** 所有API调用都要有try-catch，网络超时设置为15秒
7. **响应式设计：** 桌面端左右两栏布局，移动端上下堆叠布局（使用Tailwind的 `lg:` 断点）
8. **空状态处理：** 初始加载、无历史记录、识别失败三种空状态都要有友好的UI提示
9. **GPU加速：** 如果系统有NVIDIA GPU并安装了CUDA，模型会自动使用GPU推理，显著提升速度
10. **模型兼容性：** 当前使用PyTorch 2.1.0，需确保环境版本匹配

***