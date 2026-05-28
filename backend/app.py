from flask import Flask, request, jsonify
from flask_cors import CORS
from services.classifier import recognize_plant
from services.flower_info import get_flower_detail

app = Flask(__name__)
CORS(app)
app.json.ensure_ascii = False
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "美丽花卉识别系统",
        "version": "2.0.0"
    })


@app.route("/api/recognize", methods=["POST"])
def recognize():
    try:
        data = request.get_json()
        if not data or "image" not in data:
            return jsonify({"success": False, "error": "请上传图片"}), 400

        image_base64 = data["image"]

        result = recognize_plant(image_base64)
        if not result["success"]:
            return jsonify(result)

        plant_data = result["data"]

        detail_result = get_flower_detail(
            plant_data["name"],
            plant_data.get("baike_description", ""),
            image_base64
        )

        if detail_result["success"]:
            detail_data = detail_result["data"]
            return jsonify({
                "success": True,
                "data": {
                    "name": detail_data.get("name", plant_data["name"]),
                    "confidence": plant_data["score"],
                    "basic_intro": detail_data.get("basic_intro", ""),
                    "detail_intro": detail_data.get("detail_intro", ""),
                    "flower_language": detail_data.get("flower_language", ""),
                    "latin_name": detail_data.get("latin_name", ""),
                    "family": detail_data.get("family", ""),
                    "genus": detail_data.get("genus", ""),
                    "alias": detail_data.get("alias", ""),
                    "images": detail_data.get("images", [])
                }
            })

        return jsonify({
            "success": True,
            "data": {
                "name": plant_data["name"],
                "confidence": plant_data["score"],
                "basic_intro": "",
                "detail_intro": "",
                "flower_language": "",
                "latin_name": "",
                "family": "",
                "genus": "",
                "alias": "",
                "images": []
            }
        })
    except Exception as e:
        print(f"识别异常: {e}")
        return jsonify({
            "success": False,
            "error": "服务器内部错误，请稍后重试",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
