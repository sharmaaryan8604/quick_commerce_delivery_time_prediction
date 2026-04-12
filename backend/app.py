from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

app = Flask(__name__)
CORS(app)


print("Loading model artifacts...")
model = joblib.load(MODEL_DIR / "best_model_pipeline.pkl")
columns = joblib.load(MODEL_DIR / "model_columns.pkl")
meta = joblib.load(MODEL_DIR / "model_meta.pkl")
print("Model artifacts loaded.")


@app.route("/")
def home():
    return "Quick Commerce Delivery Time Prediction API is running."


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json or {}

        normalized = {
            "company": data.get("company"),
            "city": data.get("city"),
            "customer_age": data.get("customer_age", 30),
            "order_value": data.get("order_value"),
            "distance_km": data.get("distance_km"),
            "items_count": data.get("items_count"),
            "product_category": data.get("product_category", data.get("product_cat")),
            "payment_method": data.get("payment_method"),
            "customer_rating": data.get("customer_rating", 3),
            "discount_applied": data.get("discount_applied", 1 if float(data.get("discount_amount", 0) or 0) > 0 else 0),
            "delivery_partner_rating": data.get("delivery_partner_rating", data.get("partner_rating", 4)),
        }

        df = pd.DataFrame([normalized]).reindex(columns=columns)
        df = df.fillna(
            {
                "company": "Swiggy Instamart",
                "city": "Noida",
                "customer_age": 30,
                "order_value": 500,
                "distance_km": 5.0,
                "items_count": 5,
                "product_category": "Groceries",
                "payment_method": "UPI",
                "customer_rating": 3,
                "discount_applied": 0,
                "delivery_partner_rating": 4,
            }
        )

        prediction = float(model.predict(df)[0])
        residual_std = float(meta["residual_std"])

        return jsonify(
            {
                "predicted_minutes": round(prediction, 2),
                "lower_bound": round(prediction - residual_std, 2),
                "upper_bound": round(prediction + residual_std, 2),
                "confidence": 91,
            }
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    app.run(debug=True)
