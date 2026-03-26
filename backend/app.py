from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

print("Loading model...")

# correct paths for your folder structure
model = joblib.load("models/best_model_pipeline.pkl")
columns = joblib.load("models/model_columns.pkl")
meta = joblib.load("models/model_meta.pkl")

print("Model loaded successfully")


@app.route("/")
def home():
    return "Quick Commerce Delivery Time Prediction API Running 🚀"


@app.route("/api/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        df = pd.DataFrame([data])

        # ensure same column order as training
        df = df[columns]

        prediction = model.predict(df)[0]

        residual_std = meta["residual_std"]

        return jsonify({
            "predicted_minutes": round(float(prediction), 2),
            "lower_bound": round(float(prediction - residual_std), 2),
            "upper_bound": round(float(prediction + residual_std), 2),
            "confidence": 91
        })

    except Exception as e:

        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)