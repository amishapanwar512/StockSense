import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axios from "axios";

const StockChart = ({ symbol, time }) => {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    fetchStockChart(symbol, time);
  }, [symbol, time]);

  const fetchStockChart = async (symbol, time) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/compare/${symbol}/${time}`);
      const { actual, predicted, dates } = response.data;
      console.log(response)

      // Transform data for recharts
      const formattedData = dates.map((date, index) => ({
        date,
        actual: actual[index],
        predicted: predicted[index],
      }));

      setStockData(formattedData);
    } catch (error) {
      console.error("Error fetching stock chart data:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Actual vs Predicted Stock Prices</h3>
      <ResponsiveContainer width="80%" height={350}>
        <LineChart data={stockData}>
          <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 12 }} />
          <YAxis tick={{ fill: "#555", fontSize: 12 }} />
          <Tooltip contentStyle={styles.tooltip} />
          <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
          <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, background: "#3B82F6" }}></span> Actual Price
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, background: "#10B981" }}></span> Predicted Price
        </div>
      </div>
    </div>
  );
};

// 💡 Inline CSS Styles
const styles = {
  container: {
    margin: "2rem auto",
    textAlign: "center",
    fontFamily: "sans-serif",
    maxWidth: "900px",
  },
  title: {
    color: "#333",
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  tooltip: {
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    fontSize: "0.9rem",
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1rem",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "1rem",
    color: "#444",
  },
  legendColor: {
    display: "inline-block",
    width: "15px",
    height: "15px",
    borderRadius: "50%",
    marginRight: "8px",
  },
};

export default StockChart;
