# ==========================================================
# QUICK COMMERCE DELIVERY TIME PREDICTION (IMPROVED)
# Author: Aryan Sharma
# Improvements: No data leakage, Pipeline, Better hyperparams,
#               Feature engineering, LightGBM added
# ==========================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import time
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    mean_absolute_percentage_error
)
from xgboost import XGBRegressor
import lightgbm as lgb
import joblib

# ==========================================================
# STEP 1: LOAD DATA
# ==========================================================

print("Loading dataset...")
df = pd.read_csv("quick_commerce_data_modified_cleaned.csv")
df.columns = df.columns.str.strip().str.lower()

print("Dataset shape:", df.shape)
print("Columns:", df.columns.tolist())

# ==========================================================
# STEP 2: FEATURE ENGINEERING
# ==========================================================

# Timestamp-based features (if column exists)
if "order_time" in df.columns:
    df["order_time"] = pd.to_datetime(df["order_time"], errors="coerce")
    df["hour_of_day"]  = df["order_time"].dt.hour
    df["is_weekend"]   = df["order_time"].dt.dayofweek.isin([5, 6]).astype(int)
    df["is_peak_hour"] = df["hour_of_day"].isin([8,9,12,13,18,19,20]).astype(int)
    df.drop(columns=["order_time"], inplace=True)

# Ratio feature (if both columns exist)
if "distance_km" in df.columns and "item_count" in df.columns:
    df["distance_per_item"] = df["distance_km"] / (df["item_count"] + 1)

print("Shape after feature engineering:", df.shape)

# ==========================================================
# STEP 3: DEFINE FEATURES AND TARGET
# ==========================================================

target = "delivery_time_min"
drop_cols = [target, "order_id"] if "order_id" in df.columns else [target]

X = df.drop(columns=drop_cols)
y = df[target]

cat_cols = X.select_dtypes(include="object").columns.tolist()
num_cols = X.select_dtypes(exclude="object").columns.tolist()

print(f"Categorical features: {cat_cols}")
print(f"Numerical features  : {num_cols}")

# ==========================================================
# STEP 4: TRAIN / TEST SPLIT  (before any fitting)
# ==========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Train shape:", X_train.shape)
print("Test  shape:", X_test.shape)

# ==========================================================
# STEP 5: PREPROCESSOR (fitted only on train — no leakage)
# ==========================================================

preprocessor = ColumnTransformer(transformers=[
    ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), cat_cols),
    ("num", "passthrough", num_cols)
])

# ==========================================================
# STEP 6: EVALUATION HELPER
# ==========================================================

results = []

def evaluate_model(name, pipeline, X_tr, y_tr, X_te, y_te):
    pred = pipeline.predict(X_te)

    mae  = mean_absolute_error(y_te, pred)
    rmse = np.sqrt(mean_squared_error(y_te, pred))
    r2   = r2_score(y_te, pred)
    mape = mean_absolute_percentage_error(y_te, pred) * 100

    cv   = cross_val_score(pipeline, X_tr, y_tr,
                           scoring="neg_mean_squared_error", cv=3, n_jobs=-1)
    cv_rmse = np.sqrt(-cv.mean())

    print(f"\n========== {name} ==========")
    print(f"MAE     : {mae:.2f}")
    print(f"RMSE    : {rmse:.2f}")
    print(f"R²      : {r2:.4f}")
    print(f"MAPE    : {mape:.2f}%")
    print(f"CV-RMSE : {cv_rmse:.2f}")

    # Overfitting gap
    train_pred  = pipeline.predict(X_tr)
    train_rmse  = np.sqrt(mean_squared_error(y_tr, train_pred))
    print(f"Train RMSE: {train_rmse:.2f}  |  Test RMSE: {rmse:.2f}  |  Gap: {rmse - train_rmse:.2f}")

    results.append({
        "Model": name, "MAE": mae, "RMSE": rmse,
        "R2": r2, "MAPE": mape, "CV_RMSE": cv_rmse
    })
    return pred

# ==========================================================
# STEP 7: TRAIN MODELS
# ==========================================================

# --- Linear Regression ---
start = time.time()
lr_pipe = Pipeline([("pre", preprocessor), ("model", LinearRegression())])
lr_pipe.fit(X_train, y_train)
print(f"\nLinear Regression time: {(time.time()-start)/60:.2f} min")
evaluate_model("Linear Regression", lr_pipe, X_train, y_train, X_test, y_test)

# --- Random Forest ---
start = time.time()
rf_pipe = Pipeline([
    ("pre", preprocessor),
    ("model", RandomForestRegressor(
        n_estimators=150, max_depth=12,
        min_samples_split=4, random_state=42, n_jobs=-1
    ))
])
rf_pipe.fit(X_train, y_train)
print(f"\nRandom Forest time: {(time.time()-start)/60:.2f} min")
evaluate_model("Random Forest", rf_pipe, X_train, y_train, X_test, y_test)

# --- XGBoost (improved params) ---
start = time.time()
xgb_pipe = Pipeline([
    ("pre", preprocessor),
    ("model", XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        tree_method="hist",
        n_jobs=-1,
        verbosity=0
    ))
])
xgb_pipe.fit(X_train, y_train)
print(f"\nXGBoost time: {(time.time()-start)/60:.2f} min")
pred_xgb = evaluate_model("XGBoost", xgb_pipe, X_train, y_train, X_test, y_test)

# --- LightGBM ---
start = time.time()
lgb_pipe = Pipeline([
    ("pre", preprocessor),
    ("model", lgb.LGBMRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        n_jobs=-1,
        verbose=-1
    ))
])
lgb_pipe.fit(X_train, y_train)
print(f"\nLightGBM time: {(time.time()-start)/60:.2f} min")
pred_lgb = evaluate_model("LightGBM", lgb_pipe, X_train, y_train, X_test, y_test)

# ==========================================================
# STEP 8: MODEL COMPARISON
# ==========================================================

results_df = pd.DataFrame(results).sort_values("RMSE")
print("\n================ MODEL COMPARISON ================")
print(results_df.to_string(index=False))

best_model_name = results_df.iloc[0]["Model"]
print(f"\nBest model: {best_model_name}")

# Pick best pipeline
best_pipe = {
    "Linear Regression": lr_pipe,
    "Random Forest":     rf_pipe,
    "XGBoost":           xgb_pipe,
    "LightGBM":          lgb_pipe,
}[best_model_name]

# ==========================================================
# STEP 9: RESIDUAL ANALYSIS (best model)
# ==========================================================

best_pred = best_pipe.predict(X_test)
residuals = y_test - best_pred

plt.figure(figsize=(8, 5))
plt.hist(residuals, bins=40, edgecolor="white")
plt.title(f"Residual Distribution — {best_model_name}")
plt.xlabel("Residual (min)")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("residuals.png", dpi=150)
plt.show()

# ==========================================================
# STEP 10: FEATURE IMPORTANCE (XGBoost)
# ==========================================================

xgb_model = xgb_pipe.named_steps["model"]
feature_names = (
    cat_cols +
    num_cols
)

importance = pd.DataFrame({
    "Feature":    feature_names,
    "Importance": xgb_model.feature_importances_
}).sort_values("Importance", ascending=False)

plt.figure(figsize=(8, 6))
plt.barh(importance["Feature"][:10], importance["Importance"][:10])
plt.gca().invert_yaxis()
plt.title("Top 10 Features — XGBoost")
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150)
plt.show()

print("\nTop 10 Features:")
print(importance.head(10).to_string(index=False))

# ==========================================================
# STEP 11: PREDICTION INTERVAL (±1 std of residuals)
# ==========================================================

residual_std = residuals.std()
print(f"\nPrediction interval (±1σ): ±{residual_std:.2f} minutes")
print("Use this in your API response as confidence range.")

# ==========================================================
# STEP 12: SAVE ARTIFACTS
# ==========================================================

joblib.dump(best_pipe,          "best_model_pipeline.pkl", compress=3)
joblib.dump(xgb_pipe,           "xgb_pipeline.pkl",        compress=3)
joblib.dump(lgb_pipe,           "lgb_pipeline.pkl",        compress=3)
joblib.dump(X_train.columns.tolist(), "model_columns.pkl")
joblib.dump({"residual_std": residual_std}, "model_meta.pkl")

import os
print(f"\nSaved best_model_pipeline.pkl — {os.path.getsize('best_model_pipeline.pkl')/1024:.1f} KB")

# ==========================================================
# STEP 13: BUSINESS INSIGHTS
# ==========================================================

print("\nBusiness Insights:")
print("• Feature engineering (hour_of_day, is_peak_hour) improves time-aware predictions.")
print("• distance_per_item captures load-adjusted distance — strong predictor.")
print("• LightGBM often matches XGBoost at lower memory usage.")
print("• Prediction interval exposed via API gives users realistic ETA ranges.")
print("• Pipeline ensures zero data leakage between train and test sets.")