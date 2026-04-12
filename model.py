from __future__ import annotations

import json
import warnings
from datetime import datetime, timezone
from pathlib import Path

import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    HAS_MATPLOTLIB = True
except ImportError:
    plt = None
    HAS_MATPLOTLIB = False


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "quick_commerce_data_modified_cleaned.csv"
ARTIFACT_DIR = ROOT / "backend" / "models"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip().str.lower()

    if "order_time" in df.columns:
        df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
        df["hour_of_day"] = df["order_time"].dt.hour
        df["is_weekend"] = df["order_time"].dt.dayofweek.isin([5, 6]).astype(int)
        df["is_peak_hour"] = df["hour_of_day"].isin([8, 9, 12, 13, 18, 19, 20]).astype(int)
        df = df.drop(columns=["order_time"])

    if "distance_km" in df.columns and "item_count" in df.columns:
        df["distance_per_item"] = df["distance_km"] / (df["item_count"] + 1)

    return df


def build_preprocessor(x_train: pd.DataFrame) -> tuple[ColumnTransformer, list[str], list[str]]:
    cat_cols = x_train.select_dtypes(include="object").columns.tolist()
    num_cols = x_train.select_dtypes(exclude="object").columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), cat_cols),
            ("num", "passthrough", num_cols),
        ]
    )

    return preprocessor, cat_cols, num_cols


def evaluate_model(name, pipeline, x_train, y_train, x_test, y_test):
    pred = pipeline.predict(x_test)

    mae = mean_absolute_error(y_test, pred)
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    r2 = r2_score(y_test, pred)
    mape = mean_absolute_percentage_error(y_test, pred) * 100

    cv = cross_val_score(
        pipeline,
        x_train,
        y_train,
        scoring="neg_mean_squared_error",
        cv=3,
        n_jobs=1,
    )
    cv_rmse = np.sqrt(-cv.mean())

    train_pred = pipeline.predict(x_train)
    train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))

    print(f"\n========== {name} ==========")
    print(f"MAE      : {mae:.2f}")
    print(f"RMSE     : {rmse:.2f}")
    print(f"R^2      : {r2:.4f}")
    print(f"MAPE     : {mape:.2f}%")
    print(f"CV-RMSE  : {cv_rmse:.2f}")
    print(f"Train RMSE: {train_rmse:.2f} | Test RMSE: {rmse:.2f} | Gap: {rmse - train_rmse:.2f}")

    return {
        "Model": name,
        "MAE": float(mae),
        "RMSE": float(rmse),
        "R2": float(r2),
        "MAPE": float(mape),
        "CV_RMSE": float(cv_rmse),
    }


def main():
    print("Loading dataset...")
    df = load_dataset()
    print("Dataset shape:", df.shape)
    print("Columns:", df.columns.tolist())

    target = "delivery_time_min"
    drop_cols = [target, "order_id"] if "order_id" in df.columns else [target]
    x = df.drop(columns=drop_cols)
    y = df[target]

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    print("Train shape:", x_train.shape)
    print("Test shape :", x_test.shape)

    preprocessor, cat_cols, num_cols = build_preprocessor(x_train)
    results = []

    lr_pipe = Pipeline([("pre", preprocessor), ("model", LinearRegression())])
    lr_pipe.fit(x_train, y_train)
    results.append(evaluate_model("Linear Regression", lr_pipe, x_train, y_train, x_test, y_test))

    rf_pipe = Pipeline(
        [
            ("pre", preprocessor),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=150,
                    max_depth=12,
                    min_samples_split=4,
                    random_state=42,
                    n_jobs=1,
                ),
            ),
        ]
    )
    rf_pipe.fit(x_train, y_train)
    results.append(evaluate_model("Random Forest", rf_pipe, x_train, y_train, x_test, y_test))

    xgb_pipe = Pipeline(
        [
            ("pre", preprocessor),
            (
                "model",
                XGBRegressor(
                    n_estimators=300,
                    max_depth=6,
                    learning_rate=0.05,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    reg_alpha=0.1,
                    reg_lambda=1.0,
                    tree_method="hist",
                    n_jobs=1,
                    verbosity=0,
                ),
            ),
        ]
    )
    xgb_pipe.fit(x_train, y_train)
    results.append(evaluate_model("XGBoost", xgb_pipe, x_train, y_train, x_test, y_test))

    lgb_pipe = Pipeline(
        [
            ("pre", preprocessor),
            (
                "model",
                lgb.LGBMRegressor(
                    n_estimators=300,
                    max_depth=6,
                    learning_rate=0.05,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    reg_alpha=0.1,
                    reg_lambda=1.0,
                    n_jobs=1,
                    verbose=-1,
                ),
            ),
        ]
    )
    lgb_pipe.fit(x_train, y_train)
    results.append(evaluate_model("LightGBM", lgb_pipe, x_train, y_train, x_test, y_test))

    results_df = pd.DataFrame(results).sort_values("RMSE")
    print("\n================ MODEL COMPARISON ================")
    print(results_df.to_string(index=False))

    best_model_name = results_df.iloc[0]["Model"]
    print(f"\nBest model: {best_model_name}")

    model_lookup = {
        "Linear Regression": lr_pipe,
        "Random Forest": rf_pipe,
        "XGBoost": xgb_pipe,
        "LightGBM": lgb_pipe,
    }
    best_pipe = model_lookup[best_model_name]

    best_pred = best_pipe.predict(x_test)
    residuals = y_test - best_pred
    residual_std = float(residuals.std())

    if HAS_MATPLOTLIB:
        plt.figure(figsize=(8, 5))
        plt.hist(residuals, bins=40, edgecolor="white")
        plt.title(f"Residual Distribution - {best_model_name}")
        plt.xlabel("Residual (min)")
        plt.ylabel("Frequency")
        plt.tight_layout()
        plt.savefig(ARTIFACT_DIR / "residuals.png", dpi=150)
        plt.close()

    xgb_model = xgb_pipe.named_steps["model"]
    importance = pd.DataFrame(
        {
            "Feature": cat_cols + num_cols,
            "Importance": xgb_model.feature_importances_,
        }
    ).sort_values("Importance", ascending=False)

    if HAS_MATPLOTLIB:
        plt.figure(figsize=(8, 6))
        plt.barh(importance["Feature"][:10], importance["Importance"][:10])
        plt.gca().invert_yaxis()
        plt.title("Top 10 Features - XGBoost")
        plt.tight_layout()
        plt.savefig(ARTIFACT_DIR / "feature_importance.png", dpi=150)
        plt.close()

    print("\nTop 10 Features:")
    print(importance.head(10).to_string(index=False))
    print(f"\nPrediction interval (+/- 1 sigma): +/-{residual_std:.2f} minutes")

    joblib.dump(best_pipe, ARTIFACT_DIR / "best_model_pipeline.pkl", compress=3)
    joblib.dump(xgb_pipe, ARTIFACT_DIR / "xgb_pipeline.pkl", compress=3)
    joblib.dump(lgb_pipe, ARTIFACT_DIR / "lgb_pipeline.pkl", compress=3)
    joblib.dump(x_train.columns.tolist(), ARTIFACT_DIR / "model_columns.pkl")

    meta = {
        "residual_std": residual_std,
        "best_model": best_model_name,
        "deployed_model": best_model_name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "evaluations": results_df.to_dict(orient="records"),
    }
    joblib.dump(meta, ARTIFACT_DIR / "model_meta.pkl")

    metrics_payload = {
        "best_model": best_model_name,
        "deployed_model": best_model_name,
        "residual_std": residual_std,
        "generated_at": meta["generated_at"],
        "models": results_df.to_dict(orient="records"),
    }
    with open(ARTIFACT_DIR / "model_metrics.json", "w", encoding="utf-8") as fh:
        json.dump(metrics_payload, fh, indent=2)

    print(f"\nSaved best_model_pipeline.pkl to {ARTIFACT_DIR}")


if __name__ == "__main__":
    main()
