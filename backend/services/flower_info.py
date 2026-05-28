import json
import os

FLOWER_INFO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "flower_info.json")

_db = None

def _load_db():
    global _db
    if _db is not None:
        return _db
    if os.path.exists(FLOWER_INFO_PATH):
        with open(FLOWER_INFO_PATH, "r", encoding="utf-8") as f:
            _db = json.load(f)
    else:
        _db = {}
    return _db


def get_flower_detail(name, baike_description="", image_base64=None):
    db = _load_db()
    info = db.get(name)

    if info:
        return {
            "success": True,
            "data": {
                "name": name,
                "basic_intro": info.get("basic_intro", ""),
                "detail_intro": "",
                "flower_language": info.get("flower_language", ""),
                "latin_name": info.get("latin_name", ""),
                "family": info.get("family", ""),
                "genus": info.get("genus", ""),
                "alias": info.get("alias", []),
                "images": []
            }
        }

    return {
        "success": True,
        "data": {
            "name": name,
            "basic_intro": f"识别到 {name}，暂无更详细的介绍信息",
            "detail_intro": "",
            "flower_language": "",
            "latin_name": "",
            "family": "",
            "genus": "",
            "alias": [],
            "images": []
        }
    }
