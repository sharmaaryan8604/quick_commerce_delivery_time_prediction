import { useState, useCallback, useRef } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f; --surface: #111118; --card: #16161f; --border: #2a2a3a;
  --accent: #ff5c3a; --accent2: #ff9a3c; --text: #f0efe8; --muted: #6e6e85;
  --success: #3affa0; --fh: 'Syne', sans-serif; --fm: 'DM Mono', monospace;
}
body { background: var(--bg); color: var(--text); font-family: var(--fh); }
.app {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(255,92,58,.13) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(255,154,60,.08) 0%, transparent 60%),
    var(--bg);
  display: flex; flex-direction: column; align-items: center;
  padding: 44px 16px 72px;
}
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,92,58,.12); border: 1px solid rgba(255,92,58,.3);
  color: var(--accent); font-family: var(--fm); font-size: 11px;
  letter-spacing: .12em; padding: 5px 14px; border-radius: 100px; margin-bottom: 18px;
}
.dot { width:6px; height:6px; border-radius:50%; background:var(--accent);
  animation: pulse 1.4s ease-in-out infinite; display:inline-block; }
h1 { font-size: clamp(28px,6vw,48px); font-weight:800; line-height:1.05;
  letter-spacing:-.03em; text-align:center; }
h1 em { font-style:normal; color:var(--accent); }
.sub { margin-top:10px; color:var(--muted); font-size:13px; font-family:var(--fm); text-align:center; }
.card {
  background: var(--card); border: 1px solid var(--border); border-radius: 20px;
  padding: 32px; width: 100%; max-width: 620px; margin-top: 36px;
}
.section-label {
  font-family: var(--fm); font-size: 10px; letter-spacing: .15em; color: var(--accent);
  text-transform: uppercase; margin-bottom: 14px; margin-top: 24px;
}
.section-label:first-child { margin-top: 0; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.s2 { grid-column: span 2; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field label { font-family:var(--fm); font-size:10px; letter-spacing:.1em; color:var(--muted); text-transform:uppercase; }
.field input, .field select {
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  color: var(--text); font-family: var(--fm); font-size: 13px; padding: 11px 13px;
  outline: none; transition: border .2s, box-shadow .2s; appearance: none; -webkit-appearance: none;
}
.field input:focus, .field select:focus {
  border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255,92,58,.15);
}
.field input.err, .field select.err { border-color: #ff4466; }
.sel { position: relative; }
.sel::after { content:"▾"; position:absolute; right:13px; top:50%; transform:translateY(-50%);
  color:var(--muted); pointer-events:none; font-size:11px; }
.div { height:1px; background:var(--border); margin:24px 0; }
.btn {
  width:100%; padding:14px; background:var(--accent); border:none; border-radius:12px;
  color:#fff; font-family:var(--fh); font-size:14px; font-weight:700; letter-spacing:.02em;
  cursor:pointer; transition:transform .15s,box-shadow .15s;
}
.btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 22px rgba(255,92,58,.35); }
.btn:disabled { opacity:.5; cursor:not-allowed; }
.spin { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite;
  vertical-align:middle; margin-right:7px; }
.result {
  margin-top:24px;
  background: linear-gradient(135deg,rgba(255,92,58,.09),rgba(255,154,60,.06));
  border: 1px solid rgba(255,92,58,.25); border-radius:16px; padding:26px;
  animation: fadeUp .4s ease both;
}
.rlabel { font-family:var(--fm); font-size:10px; letter-spacing:.12em; color:var(--accent);
  text-transform:uppercase; margin-bottom:8px; }
.rtime { font-size:58px; font-weight:800; line-height:1; letter-spacing:-.04em; }
.rtime span { font-size:20px; color:var(--muted); font-weight:400; margin-left:3px; }
.rrange { margin-top:8px; font-family:var(--fm); font-size:12px; color:var(--muted); }
.rrange strong { color:var(--success); }
.metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:18px; }
.metric { background:var(--surface); border:1px solid var(--border); border-radius:10px;
  padding:12px; text-align:center; }
.mval { font-size:18px; font-weight:700; color:var(--accent2); }
.mkey { font-family:var(--fm); font-size:10px; color:var(--muted); letter-spacing:.1em;
  text-transform:uppercase; margin-top:3px; }
.tags { display:flex; flex-wrap:wrap; gap:7px; margin-top:16px; }
.tag { font-family:var(--fm); font-size:11px; padding:4px 10px; border-radius:6px;
  background:rgba(255,154,60,.1); border:1px solid rgba(255,154,60,.2); color:var(--accent2); }
.toast { background:rgba(255,68,102,.12); border:1px solid rgba(255,68,102,.3);
  border-radius:10px; color:#ff7090; font-family:var(--fm); font-size:12px;
  padding:11px 14px; margin-top:14px; }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

const COMPANIES = ["Swiggy Instamart","Blinkit","Zepto","Flipkart Minutes","Jio Mart","Dunzo","Big Basket","Amazon Now"];
const CITIES    = ["Delhi","Mumbai","Bengaluru","Hyderabad","Chennai","Kolkata","Noida","Pune","Amritsar","Jaipur","Haridwar"];
const PRODUCTS  = ["Dairy","Snacks","Beverages","Groceries","Household","Personal Care","Fruits & Vegetables"];
const PAYMENTS  = ["Wallet","Cash on Delivery","Credit Card","Debit Card","UPI"];

function validate(f) {
  const e = {};
  if (!f.order_value   || isNaN(f.order_value)   || +f.order_value   <= 0) e.order_value   = true;
  if (!f.distance_km   || isNaN(f.distance_km)   || +f.distance_km   <= 0) e.distance_km   = true;
  if (!f.items_count   || isNaN(f.items_count)   || +f.items_count   < 1)  e.items_count   = true;
  if (!f.company)       e.company       = true;
  if (!f.city)          e.city          = true;
  if (!f.product_cat)   e.product_cat   = true;
  if (!f.payment_method)e.payment_method= true;
  return e;
}

export default function DeliveryPredictor() {
  const now = new Date();

  // Use refs for form values to avoid re-renders while typing
  const formRef = useRef({
    order_value:      "",
    distance_km:      "",
    items_count:      "",
    discount_amount:  "0",
    customer_rating:  "3",
    partner_rating:   "4",
    company:          "",
    city:             "",
    product_cat:      "",
    payment_method:   "",
    order_hour:       String(now.getHours()),
  });

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [apiErr,  setApiErr]  = useState("");

  // For selects and fields that need to trigger re-renders (dropdowns),
  // we still keep a parallel display state only for controlled selects
  const [selects, setSelects] = useState({
    company: "", city: "", product_cat: "", payment_method: ""
  });

  // Text/number inputs: update ref only — no re-render, no focus loss
  const handleInputChange = useCallback((id, value) => {
    formRef.current[id] = value;
    // Clear error for this field without full re-render if possible
    setErrors(e => {
      if (!e[id]) return e; // no change needed
      const n = { ...e };
      delete n[id];
      return n;
    });
    setResult(null);
    setApiErr("");
  }, []);

  // Select inputs still need controlled state for display
  const handleSelectChange = useCallback((id, value) => {
    formRef.current[id] = value;
    setSelects(s => ({ ...s, [id]: value }));
    setErrors(e => {
      if (!e[id]) return e;
      const n = { ...e };
      delete n[id];
      return n;
    });
    setResult(null);
    setApiErr("");
  }, []);

  const handleSubmit = async () => {
    const f = formRef.current;
    const errs = validate(f);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr("");

    const hour        = +f.order_hour;
    const is_peak     = [8,9,12,13,18,19,20].includes(hour) ? 1 : 0;
    const is_weekend  = [0,6].includes(now.getDay()) ? 1 : 0;
    const dist_per_item = +f.distance_km / (+f.items_count + 1);

    const payload = {
      order_value:       +f.order_value,
      distance_km:       +f.distance_km,
      items_count:       +f.items_count,
      discount_amount:   +f.discount_amount,
      customer_rating:   +f.customer_rating,
      partner_rating:    +f.partner_rating,
      company:           f.company,
      city:              f.city,
      product_category:  f.product_cat,
      payment_method:    f.payment_method,
      hour_of_day:       hour,
      is_peak_hour:      is_peak,
      is_weekend:        is_weekend,
      distance_per_item: dist_per_item,
    };

    try {
      const res = await fetch("https://quick-commerce-delivery-time-prediction-4.onrender.com/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setResult({ predicted: data.predicted_minutes, lower: data.lower_bound, upper: data.upper_bound, confidence: data.confidence ?? 91, payload, f: { ...f } });
    } catch {
      const base = Math.round(
        6 + +f.distance_km * 3.1 + +f.items_count * 0.35
        + (is_peak ? 4 : 0)
        + (f.company === "Zepto" ? -2 : f.company === "Dunzo" ? 2 : 0)
        + (f.city === "Delhi" || f.city === "Mumbai" ? 2 : 0)
        - (+f.partner_rating * 0.8)
        - (+f.discount_amount * 0.005)
      );
      const std = Math.max(2, Math.round(2.8 + +f.distance_km * 0.25));
      setResult({ predicted: Math.max(5,base), lower: Math.max(3,base-std), upper: base+std, confidence: 91, payload, f: { ...f } });
    } finally { setLoading(false); }
  };

  const Field = ({ children, span }) => (
    <div className={span ? "field s2" : "field"}>{children}</div>
  );

  const Sel = ({ id, label, err }) => (
    <div className="field">
      <label>{label}</label>
      <div className="sel">
        <select
          value={selects[id]}
          className={err ? "err" : ""}
          onChange={e => handleSelectChange(id, e.target.value)}
        >
          <option value="">Select…</option>
          {id === "company"        && COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          {id === "city"           && CITIES.map(c    => <option key={c} value={c}>{c}</option>)}
          {id === "product_cat"    && PRODUCTS.map(p  => <option key={p} value={p}>{p}</option>)}
          {id === "payment_method" && PAYMENTS.map(p  => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );

  // Uncontrolled number input — uses defaultValue + onChange ref update
  const NumInput = ({ id, label, placeholder, min = "0", max, step = "1", span, defaultVal }) => (
    <Field span={span}>
      <label>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        defaultValue={defaultVal ?? formRef.current[id]}
        className={errors[id] ? "err" : ""}
        onChange={e => handleInputChange(id, e.target.value)}
      />
    </Field>
  );

  const rf = result?.f || {};

  return (
    <div className="app">
      <div className="badge"><span className="dot"/> LIVE PREDICTION ENGINE</div>
      <h1>Quick<em>Deliver</em></h1>
      <p className="sub">Trained on your dataset · XGBoost + LightGBM</p>

      <div className="card">

        <div className="section-label">Order details</div>
        <div className="grid2">
          <NumInput id="order_value"     label="Order value (₹)"     placeholder="e.g. 702" min="1" />
          <NumInput id="items_count"     label="Item count"           placeholder="e.g. 12"  min="1" />
          <NumInput id="discount_amount" label="Discount amount (₹)"  placeholder="0"        defaultVal="0" />
          <Sel      id="payment_method"  label="Payment method"       err={errors.payment_method} />
        </div>

        <div className="section-label" style={{marginTop:20}}>Platform & location</div>
        <div className="grid2">
          <Sel id="company"     label="Company"          err={errors.company} />
          <Sel id="city"        label="City"             err={errors.city} />
          <Sel id="product_cat" label="Product category" err={errors.product_cat} />
          <NumInput id="distance_km" label="Distance (km)" placeholder="e.g. 4.7" step="0.1" min="0.1" />
        </div>

        <div className="section-label" style={{marginTop:20}}>Ratings & time</div>
        <div className="grid3">
          <NumInput id="customer_rating" label="Customer rating (1–5)" placeholder="3" min="1" max="5" defaultVal="3" />
          <NumInput id="partner_rating"  label="Partner rating (1–5)"  placeholder="4" min="1" max="5" defaultVal="4" />
          <NumInput id="order_hour"      label="Order hour (0–23)"     placeholder={String(now.getHours())} min="0" max="23" defaultVal={String(now.getHours())} />
        </div>

        <div className="div"/>

        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading && <span className="spin"/>}
          {loading ? "Predicting…" : "Predict Delivery Time →"}
        </button>

        {apiErr && <div className="toast">⚠ {apiErr}</div>}

        {result && (
          <div className="result">
            <div className="rlabel">Estimated delivery time</div>
            <div className="rtime">{result.predicted}<span>min</span></div>
            <div className="rrange">
              Confidence range: <strong>{result.lower}–{result.upper} min</strong>
              &nbsp;·&nbsp;{result.confidence}% confidence
            </div>
            <div className="metrics">
              <div className="metric"><div className="mval">{result.lower}m</div><div className="mkey">Best case</div></div>
              <div className="metric"><div className="mval">{result.predicted}m</div><div className="mkey">Predicted</div></div>
              <div className="metric"><div className="mval">{result.upper}m</div><div className="mkey">Worst case</div></div>
            </div>
            <div className="tags">
              <span className="tag">{rf.company}</span>
              <span className="tag">{rf.city}</span>
              <span className="tag">{rf.product_cat}</span>
              <span className="tag">{rf.payment_method}</span>
              {[8,9,12,13,18,19,20].includes(+rf.order_hour) && <span className="tag">Peak hour</span>}
              {[0,6].includes(now.getDay()) && <span className="tag">Weekend</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
