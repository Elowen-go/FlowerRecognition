import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import base64
import json
import os

os.environ["TORCH_HOME"] = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", ".cache")

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "flower_model.pth")
CAT_TO_NAME_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cat_to_name.json")
IMG_SIZE = 224

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_model = None
_class_names = None


def _load_category_names():
    global _class_names
    if _class_names is not None:
        return _class_names
    with open(CAT_TO_NAME_PATH, "r", encoding="utf-8") as f:
        _class_names = json.load(f)
    return _class_names


def _load_model():
    global _model
    if _model is not None:
        return _model

    _load_category_names()
    model = models.densenet121(weights=None)
    model.classifier = nn.Linear(model.classifier.in_features, 102)

    state_dict = torch.load(MODEL_PATH, map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    _model = model
    return _model


def _preprocess(image_base64):
    image_data = base64.b64decode(image_base64)
    img = Image.open(io.BytesIO(image_data)).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    return transform(img).unsqueeze(0).to(device)


def recognize_plant(image_base64):
    if not os.path.exists(MODEL_PATH):
        return {"success": False, "error": "模型文件不存在，请先运行 train_model.py 训练模型"}

    try:
        model = _load_model()
        class_names = _load_category_names()
        input_tensor = _preprocess(image_base64)

        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            top_prob, top_idx = torch.max(probabilities, 0)

        top_class = top_idx.item()
        confidence = top_prob.item()

        name = class_names.get(str(top_class), f"未知花卉(#{top_class})")

        return {
            "success": True,
            "data": {
                "name": name,
                "score": round(confidence, 4),
                "baike_description": ""
            }
        }
    except Exception as e:
        return {"success": False, "error": "模型推理失败", "detail": str(e)}
