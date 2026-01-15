import { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("leaf");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showScanned, setShowScanned] = useState(true);

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
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
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

      <br /><br />

      {/* Toggle Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "20px" }}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={() => setShowHeatmap(!showHeatmap)}
          />{" "}
          Show Grad-CAM
        </label>

        <label>
          <input
            type="checkbox"
            checked={showScanned}
            onChange={() => setShowScanned(!showScanned)}
          />{" "}
          Show Scanned Regions
        </label>
      </div>

      <hr />

      {results.map((res, index) => (
        <div key={index} style={{ marginBottom: "40px" }}>
          <strong>{res.filename}</strong><br />
          Disease: {res.disease}<br />
          Confidence: {(res.confidence * 100).toFixed(2)}%<br />
          Recommendation: {res.recommendation}<br /><br />

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Original */}
            <div style={{ textAlign: "center" }}>
              <p>Original</p>
              <img
                src={`http://127.0.0.1:8000/uploads/${res.original_image}`}
                alt="original"
                width="300"
                style={{ border: "2px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Grad-CAM */}
            {showHeatmap && (
              <div style={{ textAlign: "center" }}>
                <p>Grad-CAM Heatmap</p>
                <img
                  src={`http://127.0.0.1:8000/uploads/${res.heatmap_image}`}
                  alt="heatmap"
                  width="300"
                  style={{ border: "2px solid #f00", borderRadius: "5px" }}
                />
              </div>
            )}

            {/* Precise Scan */}
            {showScanned && (
              <div style={{ textAlign: "center" }}>
                <p>Scanned Region</p>
                <img
                  src={`http://127.0.0.1:8000/uploads/${res.scanned_image}`}
                  alt="scanned"
                  width="300"
                  style={{ border: "2px solid #00f", borderRadius: "5px" }}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
