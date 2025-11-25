import React, { useState } from "react";
import UploadArea from "./components/UploadArea";
import ResultPanel from "./components/ResultPanel";
import { analyzeFile } from "./api";

function App() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setExtractedText("");
    setAi(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { text, ai } = await analyzeFile(file);
      setExtractedText(text);
      setAi(ai);   // ai = structured JSON already
    } catch (e) {
      setError(e.message || "Failed to analyze file.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewSample = () => {
    // Use local sample to preview UI without backend
    setExtractedText(sampleAi.text || "");
    setAi(sampleAi.ai || null);
    setError("");
  };

  const handleLoadServerResult = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5001/test/ai_result.json");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const obj = await res.json();
      setExtractedText(obj.text || sampleAi.text || "");
      setAi(obj.ai || obj || null);
    } catch (err) {
      setError("Failed to load server result: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Social Media Content Analyzer</h1>
        <p>Upload a PDF or image to extract text and get AI-powered engagement insights.</p>
      </header>

      <main className="app-main">
        <section className="upload-section">
          <UploadArea file={file} onFileChange={handleFileChange} loading={loading} />
          <button
            className="primary-btn"
            onClick={handleAnalyze}
            disabled={!file || loading}
          >
            {loading ? "Analyzing..." : "Analyze Content"}
          </button>
          {error && <p className="error-text">{error}</p>}
        </section>

        <section className="result-section">
          {/* ai is structured JSON → ResultPanel can show directly */}
          <ResultPanel text={extractedText} ai={ai} loading={loading} />
        </section>
      </main>

      <footer className="app-footer">
        <p>Built for a technical assessment — replace with your name & company.</p>
      </footer>
    </div>
  );
}

export default App;
