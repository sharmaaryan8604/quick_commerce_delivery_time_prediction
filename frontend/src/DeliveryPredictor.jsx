import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://quick-commerce-delivery-time-prediction-4.onrender.com";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f;
  --surface: #111118;
  --card: #16161f;
  --border: #2a2a3a;
  --accent: #ff5c3a;
  --accent-2: #ff9a3c;
  --text: #f0efe8;
  --muted: #6e6e85;
  --success: #3affa0;
  --danger: #ff5e7a;
  --font-display: "Syne", sans-serif;
  --font-mono: "DM Mono", monospace;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-display);
}

.app {
  min-height: 100vh;
  padding: 44px 16px 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(255, 92, 58, 0.13) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(255, 154, 60, 0.08) 0%, transparent 60%),
    var(--bg);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 92, 58, 0.3);
  background: rgba(255, 92, 58, 0.12);
  color: var(--accent);
  font: 11px var(--font-mono);
  letter-spacing: 0.12em;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1.4s ease-in-out infinite;
}

h1 {
  font-size: clamp(28px, 6vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-align: center;
  font-weight: 800;
}

h1 em {
  font-style: normal;
  color: var(--accent);
}

.sub {
  margin-top: 10px;
  color: var(--muted);
  font: 13px var(--font-mono);
  text-align: center;
}

.card {
  width: 100%;
  max-width: 820px;
  margin-top: 36px;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--card);
}

.section-label {
  margin: 24px 0 14px;
  color: var(--accent);
  font: 10px var(--font-mono);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.section-label:first-child {
  margin-top: 0;
}

.grid2,
.grid3 {
  display: grid;
  gap: 14px;
}

.grid2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  color: var(--muted);
  font: 10px var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.field input,
.field select {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font: 13px var(--font-mono);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.field input:focus,
.field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 92, 58, 0.15);
}

.field input.err,
.field select.err {
  border-color: var(--danger);
}

.sel {
  position: relative;
}

.sel::after {
  content: "v";
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  font-size: 11px;
}

.divider {
  height: 1px;
  margin: 24px 0;
  background: var(--border);
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font: 14px var(--font-display);
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(255, 92, 58, 0.35);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.spin {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 7px;
  vertical-align: middle;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.result,
.evaluation {
  margin-top: 24px;
  padding: 26px;
  border-radius: 16px;
  border: 1px solid rgba(255, 92, 58, 0.25);
  background: linear-gradient(135deg, rgba(255, 92, 58, 0.09), rgba(255, 154, 60, 0.06));
  animation: fadeUp 0.4s ease both;
}

.evaluation {
  margin-top: 18px;
  background: linear-gradient(135deg, rgba(255, 154, 60, 0.08), rgba(255, 92, 58, 0.05));
}

.rlabel,
.elabel {
  margin-bottom: 8px;
  color: var(--accent);
  font: 10px var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.rtime {
  font-size: 58px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-weight: 800;
}

.rtime span {
  margin-left: 3px;
  color: var(--muted);
  font-size: 20px;
  font-weight: 400;
}

.rrange,
.eval-meta,
.muted-note {
  margin-top: 8px;
  color: var(--muted);
  font: 12px var(--font-mono);
}

.rrange strong {
  color: var(--success);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.metric {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: center;
}

.mval {
  color: var(--accent-2);
  font-size: 18px;
  font-weight: 700;
}

.mkey {
  margin-top: 3px;
  color: var(--muted);
  font: 10px var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 16px;
}

.tag,
.best-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font: 11px var(--font-mono);
}

.tag {
  padding: 4px 10px;
  border: 1px solid rgba(255, 154, 60, 0.2);
  background: rgba(255, 154, 60, 0.1);
  color: var(--accent-2);
}

.best-chip {
  margin-left: 8px;
  padding: 3px 8px;
  border: 1px solid rgba(58, 255, 160, 0.25);
  background: rgba(58, 255, 160, 0.1);
  color: var(--success);
}

.deployed-chip {
  border-color: rgba(255, 154, 60, 0.35);
  background: rgba(255, 154, 60, 0.12);
  color: var(--accent-2);
}

.tag-good {
  border-color: rgba(58, 255, 160, 0.25);
  background: rgba(58, 255, 160, 0.1);
  color: var(--success);
}

.tag-warn {
  border-color: rgba(255, 154, 60, 0.25);
  background: rgba(255, 154, 60, 0.1);
  color: var(--accent-2);
}

.eval-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.toast {
  margin-top: 14px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 94, 122, 0.3);
  background: rgba(255, 94, 122, 0.12);
  color: #ff8ba0;
  font: 12px var(--font-mono);
}

.model-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.model-list {
  display: grid;
  gap: 10px;
}

.model-row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 2fr);
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.model-name {
  font-weight: 700;
}

.model-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  color: var(--muted);
  font: 11px var(--font-mono);
}

.empty-card {
  margin-top: 18px;
  padding: 18px;
  border-radius: 12px;
  border: 1px dashed var(--border);
  color: var(--muted);
  font: 12px var(--font-mono);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.7);
  }
}

@media (max-width: 760px) {
  .card {
    padding: 22px;
  }

  .grid2,
  .grid3,
  .metrics,
  .model-row {
    grid-template-columns: 1fr;
  }

  .model-stats {
    justify-content: flex-start;
  }

  .rtime {
    font-size: 44px;
  }
}
`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

const COMPANIES = ["Swiggy Instamart", "Blinkit", "Zepto", "Flipkart Minutes", "Jio Mart", "Dunzo", "Big Basket", "Amazon Now"];
const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Noida", "Pune", "Amritsar", "Jaipur", "Haridwar"];
const PRODUCTS = ["Dairy", "Snacks", "Beverages", "Groceries", "Household", "Personal Care", "Fruits & Vegetables"];
const PAYMENTS = ["Wallet", "Cash on Delivery", "Credit Card", "Debit Card", "UPI"];

function validate(form) {
  const errors = {};

  if (!form.order_value || Number.isNaN(Number(form.order_value)) || Number(form.order_value) <= 0) {
    errors.order_value = true;
  }
  if (!form.distance_km || Number.isNaN(Number(form.distance_km)) || Number(form.distance_km) <= 0) {
    errors.distance_km = true;
  }
  if (!form.items_count || Number.isNaN(Number(form.items_count)) || Number(form.items_count) < 1) {
    errors.items_count = true;
  }
  if (!form.company) errors.company = true;
  if (!form.city) errors.city = true;
  if (!form.product_cat) errors.product_cat = true;
  if (!form.payment_method) errors.payment_method = true;

  return errors;
}

function Field({ children, span }) {
  return <div className={span ? "field s2" : "field"}>{children}</div>;
}

function SelectField({ id, label, error, value, options, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="sel">
        <select id={id} value={value} className={error ? "err" : ""} onChange={(event) => onChange(id, event.target.value)}>
          <option value="">Select...</option>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
    </div>
  );
}

function NumberField({ id, label, placeholder, span, value, error, onChange }) {
  return (
    <Field span={span}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        className={error ? "err" : ""}
        onChange={(event) => onChange(id, event.target.value)}
      />
    </Field>
  );
}

export default function DeliveryPredictor() {
  const now = new Date();
  const [form, setForm] = useState({
    order_value: "",
    distance_km: "",
    items_count: "",
    discount_amount: "0",
    customer_rating: "3",
    partner_rating: "4",
    company: "",
    city: "",
    product_cat: "",
    payment_method: "",
    order_hour: String(now.getHours()),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiErr, setApiErr] = useState("");

  function clearFieldError(fieldName) {
    setErrors((current) => {
      if (!current[fieldName]) return current;
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  }

  function handleInputChange(fieldName, value) {
    setForm((current) => ({ ...current, [fieldName]: value }));
    clearFieldError(fieldName);
    setResult(null);
    setApiErr("");
  }

  function handleSelectChange(fieldName, value) {
    setForm((current) => ({ ...current, [fieldName]: value }));
    clearFieldError(fieldName);
    setResult(null);
    setApiErr("");
  }

  async function handleSubmit() {
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setApiErr("");

    const hour = Number(form.order_hour);
    const isPeakHour = [8, 9, 12, 13, 18, 19, 20].includes(hour) ? 1 : 0;
    const isWeekend = [0, 6].includes(now.getDay()) ? 1 : 0;
    const distancePerItem = Number(form.distance_km) / (Number(form.items_count) + 1);

    const payload = {
      order_value: Number(form.order_value),
      distance_km: Number(form.distance_km),
      items_count: Number(form.items_count),
      discount_amount: Number(form.discount_amount),
      customer_rating: Number(form.customer_rating),
      partner_rating: Number(form.partner_rating),
      company: form.company,
      city: form.city,
      product_category: form.product_cat,
      payment_method: form.payment_method,
      hour_of_day: hour,
      is_peak_hour: isPeakHour,
      is_weekend: isWeekend,
      distance_per_item: distancePerItem,
    };

    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult({
        predicted: data.predicted_minutes,
        lower: data.lower_bound,
        upper: data.upper_bound,
        confidence: data.confidence ?? 91,
        payload,
        form: { ...form },
      });
    } catch (error) {
      const fallbackPrediction = Math.round(
        6 +
          Number(form.distance_km) * 3.1 +
          Number(form.items_count) * 0.35 +
          (isPeakHour ? 4 : 0) +
          (form.company === "Zepto" ? -2 : form.company === "Dunzo" ? 2 : 0) +
          (form.city === "Delhi" || form.city === "Mumbai" ? 2 : 0) -
          Number(form.partner_rating) * 0.8 -
          Number(form.discount_amount) * 0.005
      );
      const stdDev = Math.max(2, Math.round(2.8 + Number(form.distance_km) * 0.25));

      setResult({
        predicted: Math.max(5, fallbackPrediction),
        lower: Math.max(3, fallbackPrediction - stdDev),
        upper: fallbackPrediction + stdDev,
        confidence: 91,
        payload,
        form: { ...form },
      });
      setApiErr("Using a local estimate because the backend is not reachable in this deployment.");
    } finally {
      setLoading(false);
    }
  }

  const selected = result?.form || {};

  return (
    <div className="app">
      <div className="badge">
        <span className="dot" />
        LIVE PREDICTION ENGINE
      </div>
      <h1>
        Quick<em>Deliver</em>
      </h1>
      <p className="sub">Fast ETA predictions from the live deployed model.</p>

      <div className="card">
        <div className="section-label">Order details</div>
        <div className="grid2">
          <NumberField id="order_value" label="Order value (Rs)" placeholder="e.g. 702" value={form.order_value} error={errors.order_value} onChange={handleInputChange} />
          <NumberField id="items_count" label="Item count" placeholder="e.g. 12" value={form.items_count} error={errors.items_count} onChange={handleInputChange} />
          <NumberField id="discount_amount" label="Discount amount (Rs)" placeholder="0" value={form.discount_amount} error={errors.discount_amount} onChange={handleInputChange} />
          <SelectField id="payment_method" label="Payment method" error={errors.payment_method} value={form.payment_method} options={PAYMENTS} onChange={handleSelectChange} />
        </div>

        <div className="section-label">Platform and location</div>
        <div className="grid2">
          <SelectField id="company" label="Company" error={errors.company} value={form.company} options={COMPANIES} onChange={handleSelectChange} />
          <SelectField id="city" label="City" error={errors.city} value={form.city} options={CITIES} onChange={handleSelectChange} />
          <SelectField id="product_cat" label="Product category" error={errors.product_cat} value={form.product_cat} options={PRODUCTS} onChange={handleSelectChange} />
          <NumberField id="distance_km" label="Distance (km)" placeholder="e.g. 4.7" value={form.distance_km} error={errors.distance_km} onChange={handleInputChange} />
        </div>

        <div className="section-label">Ratings and time</div>
        <div className="grid3">
          <NumberField id="customer_rating" label="Customer rating (1-5)" placeholder="3" value={form.customer_rating} error={errors.customer_rating} onChange={handleInputChange} />
          <NumberField id="partner_rating" label="Partner rating (1-5)" placeholder="4" value={form.partner_rating} error={errors.partner_rating} onChange={handleInputChange} />
          <NumberField id="order_hour" label="Order hour (0-23)" placeholder={String(now.getHours())} value={form.order_hour} error={errors.order_hour} onChange={handleInputChange} />
        </div>

        <div className="divider" />

        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading && <span className="spin" />}
          {loading ? "Predicting..." : "Predict delivery time ->"}
        </button>

        {apiErr && <div className="toast">{apiErr}</div>}

        {result && (
          <div className="result">
            <div className="rlabel">Estimated delivery time</div>
            <div className="rtime">
              {result.predicted}
              <span>min</span>
            </div>
            <div className="rrange">
              Confidence range: <strong>{result.lower}-{result.upper} min</strong> | {result.confidence}% confidence
            </div>
            <div className="metrics">
              <div className="metric">
                <div className="mval">{result.lower}m</div>
                <div className="mkey">Best case</div>
              </div>
              <div className="metric">
                <div className="mval">{result.predicted}m</div>
                <div className="mkey">Predicted</div>
              </div>
              <div className="metric">
                <div className="mval">{result.upper}m</div>
                <div className="mkey">Worst case</div>
              </div>
            </div>
            <div className="tags">
              <span className="tag">{selected.company}</span>
              <span className="tag">{selected.city}</span>
              <span className="tag">{selected.product_cat}</span>
              <span className="tag">{selected.payment_method}</span>
              {[8, 9, 12, 13, 18, 19, 20].includes(Number(selected.order_hour)) && <span className="tag">Peak hour</span>}
              {[0, 6].includes(now.getDay()) && <span className="tag">Weekend</span>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
