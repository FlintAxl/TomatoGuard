import { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("leaf");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Please select images");
      return;
    }

    const formData = new FormData();
    formData.append("type_", type);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      alert("Backend not running");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h2>🍅 TomatoGuard</h2>

      <label>
        Select Image Type:&nbsp;
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="leaf">Leaf</option>
          <option value="fruit">Fruit</option>
        </select>
      </label>

      <br /><br />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles(e.target.files)}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        {loading ? "Scanning..." : "Scan Images"}
      </button>

      <hr />

      {results.map((res, index) => (
        <div key={index} style={{ marginBottom: "15px" }}>
          <strong>{res.filename}</strong><br />
          Disease: {res.disease}<br />
          Confidence: {(res.confidence * 100).toFixed(2)}%<br />
          Recommendation: {res.recommendation}
        </div>
      ))}
    </div>
  );
}

export default App;
