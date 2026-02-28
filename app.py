# ==========================================================
# QUICK COMMERCE DELIVERY TIME PREDICTION WEB APP
# Using XGBoost + Label Encoding
# ==========================================================

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import pandas as pd
import joblib
import uvicorn

# ----------------------------------------------------------
# Initialize FastAPI
# ----------------------------------------------------------

app = FastAPI(title="Quick Commerce Delivery Time Prediction")

# ----------------------------------------------------------
# Load Trained Model and Encoders
# ----------------------------------------------------------

model = joblib.load("xgb_model.pkl")
label_encoders = joblib.load("label_encoders.pkl")
model_columns = joblib.load("model_columns.pkl")

# ----------------------------------------------------------
# Setup Templates Folder
# ----------------------------------------------------------

templates = Jinja2Templates(directory="templates")

# ==========================================================
# HOME ROUTE
# ==========================================================

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


# ==========================================================
# PREDICTION ROUTE
# ==========================================================

@app.post("/predict", response_class=HTMLResponse)
async def predict(
    request: Request,
    company: str = Form(...),
    city: str = Form(...),
    customer_age: int = Form(...),
    order_value: float = Form(...),
    distance_km: float = Form(...),
    items_count: int = Form(...),
    product_category: str = Form(...),
    payment_method: str = Form(...),
    customer_rating: float = Form(...),
    discount_applied: int = Form(...),
    delivery_partner_rating: float = Form(...)
):

    # ------------------------------------------------------
    # Create input dictionary
    # ------------------------------------------------------

    input_dict = {
        "company": company,
        "city": city,
        "customer_age": customer_age,
        "order_value": order_value,
        "distance_km": distance_km,
        "items_count": items_count,
        "product_category": product_category,
        "payment_method": payment_method,
        "customer_rating": customer_rating,
        "discount_applied": discount_applied,
        "delivery_partner_rating": delivery_partner_rating
    }

    # Convert to DataFrame
    input_df = pd.DataFrame([input_dict])

    # ------------------------------------------------------
    # Apply Label Encoding
    # ------------------------------------------------------

    for col, le in label_encoders.items():
        if col in input_df.columns:
            input_df[col] = le.transform(input_df[col])

    # Ensure column order matches training
    input_df = input_df[model_columns]

    # ------------------------------------------------------
    # Make Prediction
    # ------------------------------------------------------

    prediction = model.predict(input_df)[0]

    # ------------------------------------------------------
    # Return Result to Dashboard
    # ------------------------------------------------------

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "prediction": round(float(prediction), 2)
        }
    )


# ==========================================================
# HEALTH CHECK ROUTE
# ==========================================================

@app.get("/health")
def health():
    return {"status": "Model Running Successfully"}


# ==========================================================
# Run Locally (Optional)
# ==========================================================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)