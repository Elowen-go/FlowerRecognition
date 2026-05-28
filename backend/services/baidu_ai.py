import requests
import time
from config import BAIDU_API_KEY, BAIDU_SECRET_KEY, BAIDU_TOKEN_URL, BAIDU_PLANT_URL

CACHE = {
    "access_token": None,
    "expires_at": 0
}

TOKEN_EXPIRY_BUFFER = 86400


def get_access_token():
    now = time.time()
    if CACHE["access_token"] and now < CACHE["expires_at"]:
        return CACHE["access_token"]

    response = requests.post(BAIDU_TOKEN_URL, params={
        "grant_type": "client_credentials",
        "client_id": BAIDU_API_KEY,
        "client_secret": BAIDU_SECRET_KEY
    })
    data = response.json()
    CACHE["access_token"] = data["access_token"]
    CACHE["expires_at"] = now + data.get("expires_in", 2592000) - TOKEN_EXPIRY_BUFFER
    return CACHE["access_token"]


def recognize_plant(image_base64):
    try:
        token = get_access_token()
        response = requests.post(
            BAIDU_PLANT_URL,
            params={"access_token": token},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={"image": image_base64, "baike_num": 1}
        )
        result = response.json()

        if "result" not in result or not result["result"]:
            return {"success": False, "error": "未能识别出花卉，请上传更清晰的图片"}

        plant_list = result["result"]
        if not plant_list:
            return {"success": False, "error": "未能识别出花卉，请上传更清晰的图片"}

        top = plant_list[0]
        name = top.get("name", "未知")
        score = top.get("score", 0)
        baike_info = top.get("baike_info", {})

        return {
            "success": True,
            "data": {
                "name": name,
                "score": score,
                "baike_description": baike_info.get("description", ""),
                "baike_image_url": baike_info.get("image_url", "")
            }
        }
    except Exception as e:
        return {"success": False, "error": "百度AI识别服务异常", "detail": str(e)}
