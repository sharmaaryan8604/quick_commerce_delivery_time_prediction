import { useEffect, useMemo, useState } from "react";
import staticMetrics from "./modelMetricsData";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

const css = `
.blog-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 72px;
  color: #f0efe8;
}

.blog-hero {
  display: grid;
  gap: 18px;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top left, rgba(255, 92, 58, 0.16), transparent 42%),
    radial-gradient(circle at bottom right, rgba(255, 154, 60, 0.08), transparent 34%),
    rgba(255, 255, 255, 0.03);
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.24);
}

.eyebrow {
  color: #ff9a3c;
  font: 11px "IBM Plex Mono", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.blog-title {
  font: 800 clamp(34px, 5vw, 68px) "Fraunces", serif;
  line-height: 0.95;
  letter-spacing: -0.04em;
  max-width: 11ch;
}

.blog-lead {
  max-width: 68ch;
  color: #b9b4c7;
  font: 400 16px/1.75 "Space Grotesk", sans-serif;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #f0efe8;
  font: 500 12px "IBM Plex Mono", monospace;
}

.blog-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.85fr);
  gap: 18px;
  margin-top: 18px;
}

.post,
.side {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.post {
  padding: 24px;
}

.post-section + .post-section {
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.section-title {
  color: #ff9a3c;
  font: 11px "IBM Plex Mono", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.section-heading {
  font: 700 22px "Fraunces", serif;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.body-text {
  color: #b9b4c7;
  font: 400 15px/1.75 "Space Grotesk", sans-serif;
}

.project-log {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.log-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.log-card {
  position: relative;
  padding: 16px 16px 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(10, 10, 15, 0.5));
  overflow: hidden;
}

.log-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #ff5c3a, #ff9a3c);
}

.log-step {
  color: #ff9a3c;
  font: 700 11px "IBM Plex Mono", monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.log-title {
  font: 700 18px "Space Grotesk", sans-serif;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

.log-copy {
  color: #b9b4c7;
  font: 400 14px/1.7 "Space Grotesk", sans-serif;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.insight {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 15, 0.6);
}

.insight-value {
  color: #ff9a3c;
  font: 800 22px "Fraunces", serif;
  letter-spacing: -0.03em;
}

.insight-label {
  margin-top: 4px;
  color: #8b879a;
  font: 11px "IBM Plex Mono", monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.aside {
  padding: 18px;
}

.aside-block + .aside-block {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.aside-title {
  color: #ff9a3c;
  font: 11px "IBM Plex Mono", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.aside-copy {
  color: #b9b4c7;
  font: 400 14px/1.7 "Space Grotesk", sans-serif;
}

.aside-badge {
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 154, 60, 0.12);
  color: #ff9a3c;
  font: 700 11px "IBM Plex Mono", monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.verdict {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 92, 58, 0.08);
}

.verdict strong {
  font: 700 18px "Space Grotesk", sans-serif;
}

.verdict span {
  color: #b9b4c7;
  font: 400 14px/1.7 "Space Grotesk", sans-serif;
}

.eval-list {
  display: grid;
  gap: 12px;
}

.eval-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 15, 0.45);
}

.eval-name {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eval-name strong {
  font: 700 20px "Space Grotesk", sans-serif;
  letter-spacing: -0.03em;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font: 500 11px "IBM Plex Mono", monospace;
}

.chip.best {
  border-color: rgba(58, 255, 160, 0.25);
  background: rgba(58, 255, 160, 0.08);
  color: #3affa0;
}

.chip.live {
  border-color: rgba(255, 154, 60, 0.28);
  background: rgba(255, 154, 60, 0.08);
  color: #ff9a3c;
}

.eval-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  color: #b9b4c7;
  font: 500 12px "IBM Plex Mono", monospace;
}

.eval-note {
  color: #8b879a;
}

.loader,
.empty-state {
  margin-top: 18px;
  padding: 18px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  color: #b9b4c7;
  font: 500 13px "IBM Plex Mono", monospace;
}

.blog-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px 16px;
  border-radius: 999px;
  border: 0;
  background: linear-gradient(135deg, #ff5c3a, #ff9a3c);
  color: white;
  font: 700 13px "Space Grotesk", sans-serif;
  cursor: pointer;
}

@media (max-width: 980px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }

  .insight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .blog-shell {
    width: min(1180px, calc(100% - 20px));
    padding-top: 18px;
  }

  .blog-hero,
  .post,
  .aside {
    padding: 18px;
    border-radius: 20px;
  }

  .insight-grid,
  .eval-card {
    grid-template-columns: 1fr;
  }

  .insight-grid {
    gap: 10px;
  }
}
`;

const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

function fmt(value, digits = 3) {
  return Number(value).toFixed(digits);
}

export default function Blog({ onOpenPredictor }) {
  const [metrics, setMetrics] = useState(staticMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMetrics() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/model-evaluations`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setMetrics(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError" && !staticMetrics?.models?.length) {
          setError("Model evaluation data is unavailable right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
    return () => controller.abort();
  }, []);

  const ordered = useMemo(() => {
    const rows = metrics?.models || [];
    return [...rows].sort((a, b) => Number(a.RMSE) - Number(b.RMSE));
  }, [metrics]);

  const top = ordered[0];
  const bestModel = metrics?.best_model;
  const deployedModel = metrics?.deployed_model || bestModel;
  const strongEnough = Boolean(top) && Number(top.RMSE) <= 1.5 && Number(top.MAE) <= 1.25 && Number(top.R2) >= 0.95;

  function delta(value, baseline) {
    if (!Number.isFinite(value) || !Number.isFinite(baseline)) return "n/a";
    const diff = value - baseline;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(3)}`;
  }

  return (
    <div className="blog-shell">
      <section className="blog-hero">
        <div className="eyebrow">Model notes</div>
        <h1 className="blog-title">Inside the delivery time model</h1>
        <p className="blog-lead">
          This page holds the model comparison, the deployment call, and the short read on whether the current ETA system is good enough to trust.
        </p>
        <div className="meta-row">
          <span className="pill">Best: {loading ? "Loading..." : bestModel || "Unknown"}</span>
          <span className="pill">Live: {loading ? "Loading..." : deployedModel || "Unknown"}</span>
          {metrics?.generated_at && <span className="pill">Updated {new Date(metrics.generated_at).toLocaleString()}</span>}
          {metrics?.residual_std && <span className="pill">Residual spread +/- {fmt(metrics.residual_std, 2)} min</span>}
        </div>
      </section>

      <div className="blog-grid">
        <article className="post">
          <div className="post-section">
            <div className="section-title">Quick take</div>
            <div className="section-heading">A small set of tree models gave us a strong ETA baseline, and the best one is only barely ahead.</div>
            <p className="body-text">
              The deployed pipeline should always match the saved best model. In the latest run that is LightGBM, with XGBoost a very close second. Random Forest stays competitive, while Linear Regression is the clear baseline and not a deployment candidate.
            </p>
            <div className="insight-grid">
              <div className="insight">
                <div className="insight-value">{top ? fmt(top.RMSE, 3) : "--"}</div>
                <div className="insight-label">Best RMSE</div>
              </div>
              <div className="insight">
                <div className="insight-value">{top ? fmt(top.MAE, 3) : "--"}</div>
                <div className="insight-label">Best MAE</div>
              </div>
              <div className="insight">
                <div className="insight-value">{top ? fmt(top.R2, 4) : "--"}</div>
                <div className="insight-label">Best R2</div>
              </div>
              <div className="insight">
                <div className="insight-value">{top ? `${fmt(top.MAPE, 2)}%` : "--"}</div>
                <div className="insight-label">MAPE</div>
              </div>
            </div>
          </div>

          <div className="post-section">
            <div className="section-title">What we have done</div>
            <div className="section-heading">A cleaner split between the predictor and the story behind it.</div>
            <p className="body-text">
              The app now feels more like a finished product: the predictor focuses only on ETA input and output, while this blog explains the model choices, deployment, and the tradeoffs in plain language.
            </p>
            <div className="project-log">
              <div className="log-grid">
                <div className="log-card">
                  <div className="log-step">01</div>
                  <div className="log-title">Moved model evaluation into the blog</div>
                  <div className="log-copy">The comparison table now lives in a readable article-style section instead of sitting inside the form.</div>
                </div>
                <div className="log-card">
                  <div className="log-step">02</div>
                  <div className="log-title">Kept the predictor focused</div>
                  <div className="log-copy">The main screen only handles order details and the ETA result, which makes it easier to use and easier to understand.</div>
                </div>
                <div className="log-card">
                  <div className="log-step">03</div>
                  <div className="log-title">Matched deployment to the best model</div>
                  <div className="log-copy">The live pipeline points to the saved best artifact so the app does not present a mismatch between score and deployment.</div>
                </div>
                <div className="log-card">
                  <div className="log-step">04</div>
                  <div className="log-title">Added a static metrics fallback</div>
                  <div className="log-copy">The blog can still show the model story on Vercel even if the backend is not reachable.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="post-section">
            <div className="section-title">Model evaluation</div>
            <div className="verdict">
              <strong>{strongEnough ? "Good enough for the current scope" : "Needs another pass before confidence goes up"}</strong>
              <span>
                {strongEnough
                  ? "The current error is low enough for a practical ETA experience, and the validation gap is tight."
                  : "The error is still acceptable as a draft, but I would want another round of tuning before treating it as final."}
              </span>
            </div>

            {error && <div className="empty-state">{error}</div>}
            {!error && loading && <div className="loader">Refreshing model evaluations...</div>}

            {!error && !loading && ordered.length === 0 && <div className="empty-state">No model comparison data is available yet.</div>}

            {!error && ordered.length > 0 && (
              <div className="eval-list">
                {ordered.map((item) => (
                  <div className="eval-card" key={item.Model}>
                    <div className="eval-name">
                      <strong>{item.Model === "Deployed model" ? "Deployed pipeline" : item.Model}</strong>
                      <div className="chip-row">
                        {item.Model === bestModel && <span className="chip best">Best</span>}
                        {item.Model === deployedModel && <span className="chip live">Live</span>}
                      </div>
                    </div>
                    <div className="eval-stats">
                      <span>RMSE {fmt(item.RMSE)}</span>
                      <span>MAE {fmt(item.MAE)}</span>
                      <span>R2 {fmt(item.R2, 4)}</span>
                      <span>MAPE {fmt(item.MAPE, 3)}%</span>
                      <span>CV RMSE {fmt(item.CV_RMSE)}</span>
                      <span className="eval-note">Delta RMSE {delta(Number(item.RMSE), Number(top?.RMSE))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <aside className="side">
          <div className="aside-block">
            <div className="aside-badge">Project note</div>
            <div className="aside-title">Why the blog exists</div>
            <p className="aside-copy">
              The predictor should stay focused on input and output. This blog is the place for the model story, tradeoffs, and the final deployment call.
            </p>
            <button className="blog-cta" onClick={onOpenPredictor}>
              Back to predictor
            </button>
          </div>

          <div className="aside-block">
            <div className="aside-title">What stands out</div>
            <p className="aside-copy">
              LightGBM and XGBoost are effectively neck and neck, but the deployment should still point to the single best saved artifact. If those ever disagree, the metrics snapshot is stale.
            </p>
          </div>

          <div className="aside-block">
            <div className="aside-title">Baseline check</div>
            <p className="aside-copy">
              Linear Regression is the sanity check here. It is much weaker than the tree-based models, which is exactly what we want to see before trusting a more expressive model.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
