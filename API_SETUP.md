# API 密钥申请教程

本文档介绍如何申请美丽花卉识别系统所需的 API 密钥。

---

## 一、百度 AI 植物识别 API

### 1. 申请地址
https://console.bce.baidu.com/ai/#/ai/imagerecognition/overview/index

### 2. 申请步骤

| 步骤 | 操作 |
|------|------|
| ① 注册登录 | 使用百度账号登录百度智能云控制台 |
| ② 进入植物识别 | 左侧菜单 → 图像识别 → 植物识别 |
| ③ 创建应用 | 点击"创建应用"，填写应用名称（如"花卉识别"） |
| ④ 获取密钥 | 创建完成后，复制 **API Key** 和 **Secret Key** |

### 3. 免费额度
- 每日 **500 次** 免费调用

### 4. 填入配置文件
将获取的密钥填入 `backend/config.py`：

```python
BAIDU_API_KEY = "你的 API Key"
BAIDU_SECRET_KEY = "你的 Secret Key"
```

---

## 二、花伴侣植物百科 API（可选）

> 注意：当前版本主要使用百度 AI，花伴侣 API 作为可选扩展。

### 1. 申请地址
https://market.aliyun.com/detail/cmapi018620

### 2. 申请步骤

| 步骤 | 操作 |
|------|------|
| ① 登录阿里云 | 使用淘宝/支付宝账号登录 |
| ② 找到商品 | 搜索"花伴侣智能植物识别" |
| ③ 免费订阅 | 点击"0元/次" → 立即购买 → 支付（0元） |
| ④ 获取密钥 | 进入[云市场控制台](https://market.console.aliyun.com/) → 已购买的服务 → 复制 **AppCode** |

### 3. 填入配置文件

```python
HUALVYOU_APP_CODE = "你的 AppCode"
```

---

## 三、配置文件示例

参考 `backend/config.py.example` 创建你的 `backend/config.py`：

```python
# 百度 AI 配置（必填）
BAIDU_API_KEY = "xxxxxxxxxxxxxxxxxxxx"
BAIDU_SECRET_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 花伴侣配置（可选）
HUALVYOU_APP_CODE = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 接口地址（无需修改）
BAIDU_TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token"
BAIDU_PLANT_URL = "https://aip.baidubce.com/rest/2.0/image-classify/v1/plant"
HUALVYOU_URL = "https://plant.plantdatas.com/api/plant_identify"
```

---

## 四、注意事项

1. **密钥安全**：`config.py` 已加入 `.gitignore`，不会提交到 Git 仓库
2. **不要分享密钥**：API Key 和 Secret Key 相当于你的账号密码
3. **额度监控**：注意免费额度使用情况，避免超额扣费

---

## 五、常见问题

**Q: 百度 AI 返回"Open api qps request limit reached"？**  
A: 需要去百度控制台申请免费额度。

**Q: 花伴侣 API 返回 403？**  
A: 可能是 AppCode 未授权新接口，需要在阿里云 API 网关控制台授权。

**Q: 可以只用百度 AI 吗？**  
A: 可以！当前版本主要依赖百度 AI，花伴侣是可选扩展。
