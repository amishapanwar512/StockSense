import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PredictionBox({ symbol }) {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPredictions(symbol);
  }, [symbol]);

  const fetchPredictions = async (symbol) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/predict/${symbol}`);
      if (response.data.predictions) {
        setPredictions(response.data.predictions);
        setError("");
      } else {
        setError(response.data.error || "Failed to fetch predictions.");
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setError("Unable to fetch data.");
    }
  };

  return (
    <div style={styles.predBox}>
      <h3 style={styles.heading}>Prediction</h3>
      <div style={styles.predict}>
        <p style={styles.para1}>Target Price</p>
        <p style={styles.para2}>(Next 10 Days Forecast)</p>
        <div style={styles.dataContainer}>
          {error ? (
            <p style={styles.error}>{error}</p>
          ) : predictions.length > 0 ? (
            predictions.map((price, index) => (
              <p key={index} style={styles.data}>
                Day {index + 1}: ${price.toFixed(2)}
              </p>
            ))
          ) : (
            <p style={styles.loading}>Fetching data...</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline CSS Styles
const styles = {
  predBox: {
    background: "#f9f9f9",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    fontFamily: "sans-serif",
    maxWidth: "60%",
    margin: "2rem auto",
  },
  heading: {
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "1rem",
  },
  predict: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
  },
  para1: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#555",
  },
  para2: {
    fontSize: "1rem",
    color: "#777",
    marginBottom: "0.5rem",
  },
  dataContainer: {
    marginTop: "1rem",
  },
  data: {
    fontSize: "1rem",
    color: "#444",
    padding: "5px 0",
  },
  loading: {
    fontSize: "1rem",
    color: "#888",
  },
  error: {
    fontSize: "1rem",
    color: "red",
  },
};
