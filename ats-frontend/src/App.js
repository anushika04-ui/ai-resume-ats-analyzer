import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState(""); 
  const [pdfError, setPdfError] = useState(false);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api`;
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfStatus("Extracting text from PDF...");
    setPdfError(false);
    try {
      const formData = new FormData();
      formData.append("resume", file); 
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success && res.data.extractedText) {
        setResumeText(res.data.extractedText);
        setPdfStatus("Resume text extracted! Scroll down and click Analyze.");
        setPdfError(false);
      } else {
        setPdfStatus(res.data.error || "Failed to extract PDF text.");
        setPdfError(true);
      }
    } catch (err) {
      setPdfStatus("Failed to extract PDF text (server error).");
      setPdfError(true);
      console.error(err);
    }
  };
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume text first (or upload a text-based PDF).");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API}/analyze`, {
        resumeText,
        jobDescription
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Analyze failed. Check backend terminal logs.");
    } finally {
      setLoading(false);
    }
  };
  const handleClear = () => {
    setResumeText("");
    setJobDescription("");
    setResult(null);
    setPdfStatus("");
    setPdfError(false);
  };
  return (
    <div className="container">
      <h1>Resume ATS Analyzer</h1>
      <p className="subtitle">
        Paste your resume and optional job description to get an ATS score and missing keywords.
      </p>
      <div className="card">
        <h3>Upload Resume PDF (Optional)</h3>
        <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
        {pdfStatus && (
          <p style={{ marginTop: "10px", color: pdfError ? "#ff6b6b" : "#7CFC98" }}>
            {pdfError ? "❌ " : "✅ "} {pdfStatus}
          </p>
        )}
      </div>
      <div className="grid">
        <div className="card">
          <h2>Resume Text</h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste resume text here..."
            rows={14}
          />
        </div>
        <div className="card">
          <h2>Job Description (Optional)</h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            rows={14}
          />
        </div>
      </div>
      <div className="actions">
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        <button onClick={handleClear} className="secondary">
          Clear
        </button>
      </div>
      {result?.success && (
        <div className="result card">
          <h2>Result: {result.summary.finalAtsScore}% Match</h2>
          <p><b>Level:</b> {result.summary.resumeLevel}</p>
          <h3>JD Match</h3>
          <p><b>Match %:</b> {result.jdAnalysis.jdMatchPercentage}%</p>
          <p><b>Matched Skills:</b> {result.jdAnalysis.matchedSkills.join(", ") || "None"}</p>
          <p><b>Missing Skills:</b> {result.jdAnalysis.missingSkills.join(", ") || "None"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
