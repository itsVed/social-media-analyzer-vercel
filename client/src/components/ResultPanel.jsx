import React from "react";

function ResultPanel({ text, ai, loading }) {
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => alert("Extracted text copied to clipboard."),
      () => alert("Failed to copy text.")
    );
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const structured = ai?.structured || ai || null;
  const modelUsed = ai?.model || (ai && ai.model) || null;

  return (
    <div className="result-container" style={{ position: "relative" }}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-inner">
            <div className="loading-spinner" />
            <div className="loading-text">
              <div style={{ fontWeight: 700 }}>Analyzing content</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Waiting for response...</div>
            </div>
          </div>
        </div>
      )}

      <div className="result-block">
        <div className="result-header">
          <h2>Extracted Text</h2>
          <div className="result-actions">
            <button className="secondary-btn" onClick={handleCopy} disabled={!text}>
              Copy
            </button>
            <button className="secondary-btn" onClick={handleDownload} disabled={!text}>
              Download
            </button>
          </div>
        </div>

        <div className="result-content">
          {text ? <pre>{text}</pre> : <p className="placeholder-text">The extracted text will appear here after you analyze a file.</p>}
        </div>
      </div>

      <div className="result-block">
        <div className="result-header">
          <h2>AI Engagement Insights</h2>
          {modelUsed && <div style={{ color: '#9ca3af', fontSize: 13 }}>Model: {modelUsed}</div>}
        </div>

        <div className="result-content ai-insights">
          {!structured ? (
            <p className="placeholder-text">AI insights will appear here once we analyze your content.</p>
          ) : (
            <>
              <div className="ai-overview">
                <div className="ai-summary">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
                  <div style={{ color: '#cbd5e1' }}>{structured.summary || '—'}</div>
                </div>

                <div className="ai-metrics">
                  <div className="metric-item">
                    <div className="metric-label">Sentiment</div>
                    <div className="metric-value sentiment">{structured.sentiment || '—'}</div>
                  </div>

                  <div className="metric-item">
                    <div className="metric-label">Engagement</div>
                    <div className="engagement-bar">
                      <div className="engagement-fill" style={{ width: `${Math.max(0, Math.min(100, structured.engagement_prediction || 0))}%` }} />
                    </div>
                    <div className="metric-small">{structured.engagement_prediction ?? '—'}/100</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Key Suggestions</div>
                {structured.key_points?.length > 0 ? (
                  <ul className="key-points">
                    {structured.key_points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="placeholder-text">—</p>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Suggested Hashtags</div>
                <div className="hashtags">
                  {structured.hashtags?.length > 0 ? (
                    structured.hashtags.map((h, i) => (
                      <span key={i} className="hashtag">#{h}</span>
                    ))
                  ) : (
                    <span className="placeholder-text">—</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultPanel;