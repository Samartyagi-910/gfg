import { useState, useRef } from "react";
import { generateDashboard, uploadCsv } from "./api";
import ChartRenderer from "./chartrenderer";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [chart, setChart] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadStatus({ type: "info", message: "Uploading..." });
      const res = await uploadCsv(file);
      setUploadStatus({ 
        type: "success", 
        message: `Loaded ${res.rows} rows and ${res.columns.length} columns.` 
      });
    } catch (err) {
      setUploadStatus({ type: "error", message: "Failed to upload CSV." });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setChart(null);
    setData(null);
    setInsights([]);
    
    try {
      const res = await generateDashboard(query);
      setData(res.data);
      setChart(res.chart);
      setInsights(res.insights || []);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Error processing query";
      alert("Error: " + errorMsg);
    }
    setLoading(false);
  };

  const isUploadSuccess = uploadStatus.type === "success";
  const isUploadError = uploadStatus.type === "error";

  return (
    <div className="app-container">
      {/* Sidebar Controls */}
      <aside className="sidebar">
        <div className="logo-section">
          <h1>Antigravity BI</h1>
        </div>

        <div className="card">
          <h3>1. DATA SOURCE</h3>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <button 
            className="upload-btn"
            onClick={() => fileInputRef.current.click()}
          >
            <span style={{ fontSize: "1.2rem" }}>📁</span> 
            {isUploadSuccess ? "Change Dataset" : "Upload CSV"}
          </button>
          
          {uploadStatus.message && (
            <p className={isUploadSuccess ? "upload-success" : isUploadError ? "upload-error" : ""}>
              {uploadStatus.message}
            </p>
          )}
        </div>

        <div className="card">
          <h3>2. ASK ANALYTICS</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              className="query-input"
              rows="3"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Total revenue by region as a bar chart"
            />
            <button 
              type="submit"
              className="primary-btn"
              disabled={loading || !query.trim()}
            >
              {loading ? "Analyzing..." : "Generate Dashboard"}
            </button>
          </form>
        </div>

        {insights.length > 0 && (
          <div className="card">
            <h3>3. KEY INSIGHTS</h3>
            <ul className="insights-list">
              {insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <div className="card chart-wrapper">
          {loading ? (
            <div className="loading-text">Generating your dashboard...</div>
          ) : chart ? (
            <div style={{ width: "100%", height: "100%" }}>
              <h2 style={{ 
                fontFamily: 'Outfit', 
                fontSize: '1.2rem', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {chart.title || "Visual Analysis"}
              </h2>
              <ChartRenderer data={data} chart={chart} />
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", textAlign: "center" }}>
              <p style={{ fontSize: "3rem", margin: "10px 0" }}>📊</p>
              <p>Upload a CSV and ask a question to see magic.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;