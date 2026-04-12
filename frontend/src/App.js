import { useState } from "react";
import "./App.css";
import Blog from "./Blog";
import DeliveryPredictor from "./DeliveryPredictor";

function App() {
  const [page, setPage] = useState("predictor");

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-kicker">Quick commerce ETA lab</span>
            <span className="brand-title">QuickDeliver</span>
          </div>
          <nav className="nav">
            <button className={page === "predictor" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("predictor")}>
              Predictor
            </button>
            <button className={page === "blog" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("blog")}>
              Blog
            </button>
          </nav>
        </div>
      </header>

      <main className="page">
        {page === "predictor" ? <DeliveryPredictor onOpenBlog={() => setPage("blog")} /> : <Blog onOpenPredictor={() => setPage("predictor")} />}
      </main>
    </div>
  );
}

export default App;
