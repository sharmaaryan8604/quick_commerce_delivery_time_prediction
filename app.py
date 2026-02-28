# ==================================================
# QUICK COMMERCE DELIVERY TIME WEB APP
# ==================================================

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import pandas as pd
import joblib
import uvicorn

app = FastAPI()

# Load model and columns
model = joblib.load("xgb_model.pkl")
model_columns = joblib.load("model_columns.pkl")

# Setup templates folder
templates = Jinja2Templates(directory="templates")


# ==============================
# HOME PAGE
# ==============================
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


# ==============================
# PREDICTION ROUTE
# ==============================
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

    # Convert input to dataframe
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

    input_df = pd.DataFrame([input_dict])

    # Apply same encoding as training
    input_df = pd.get_dummies(input_df)

    # Match training columns
    input_df = input_df.reindex(columns=model_columns, fill_value=0)

    prediction = model.predict(input_df)

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "prediction": round(float(prediction[0]), 2)
        }
    )


# ==============================
# HEALTH CHECK
# ==============================
@app.get("/health")
def health():
    return {"status": "Model Running Successfully"}


# For local run
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)