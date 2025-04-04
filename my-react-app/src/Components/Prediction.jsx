import React, { useState, useEffect } from "react";
import "./Prediction.css";
import { ChevronLeft, Search } from "lucide-react";
import StockChart from "./StockChart";
import Statistics from "./Statistics";
import Prediction_box from "./Prediction-box";
import axios from "axios";
import Footer from "./Footer";

export default function Prediction() {
  const [symbol, setSymbol] = useState("AAPL");
  const [inputValue, setInputValue] = useState("");
  const [stockInfo, setStockInfo] = useState(null);
  const [timePeriod, setTimePeriod] = useState("1y"); // Default time period

  //function to set time period
  function setTime(time) {
    setTimePeriod(time);
  }
  // Function to fetch stock info
  async function fetchStockInfo(currentSymbol) {
    try {

      const response = await axios.get(
        `http://127.0.0.1:5000/api/stock/${currentSymbol.toUpperCase()}`
      );

      console.log(response)
      setStockInfo(response.data);

    } catch (err) {
      console.log("Error fetching API:", err);
    }
  }

  // Fetch stock info when `symbol` changes
  useEffect(() => {
    if (symbol) {
      fetchStockInfo(symbol);
    }
  }, [symbol]); // Runs when `symbol` is updated

  function sendSymbol() {
    const trimmedSymbol = inputValue.trim();
    if (trimmedSymbol !== "") {
      setSymbol(trimmedSymbol); // Triggers useEffect to fetch new data
      fetchStockInfo(trimmedSymbol); // Fetch immediately to prevent delay
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-con">
          <div className="nav-left">
            <ChevronLeft className="cl" />
            <div className="logo">{stockInfo?.name}</div>
          </div>
          <div className="nav-right">
            <input
              type="text"
              placeholder="Type Symbol here (e.g., AAPL)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={sendSymbol}>
              <Search className="bl" />
            </button>
          </div>
        </div>
      </div>

      {/* PRICE SECTION */}
      <div className="price">
        <div className="price-top">
          <div className="cp">
            {stockInfo?.current_price ?? "Loading..."}
          </div>
          <div className="inc" style={{ color: stockInfo?.percentage_change >= 0 ? "green" : "red" }}>{stockInfo?.percentage_change}%</div>
        </div>
        <div className="price-btm">
          {stockInfo?.company_name ?? "Fetching Data..."}
        </div>
      </div>

    <div className="days">
      <button onClick={() => setTime("1y")}>1Y</button>
      <button onClick={() => setTime("2y")}>2Y</button>
      <button onClick={() => setTime("3y")}>3Y</button>
      <button onClick={() => setTime("4y")}>4Y</button>
      <button onClick={() => setTime("5y")}>5Y</button>
      <button onClick={() => setTime("6y")}>6Y</button>
    </div>


      {/* Chart */}
      <div className="chart">
        <StockChart symbol={stockInfo?.name}
        time={timePeriod}/>
      </div>

      {/* Prediction box */}
      <Prediction_box symbol={stockInfo?.name}/>

      {/* Statistics */}
      <Statistics
        market_cap={stockInfo?.market_cap}
        pe_ratio={stockInfo?.pe_ratio}
        low_5w={stockInfo?.low_52w}
        high_5w={stockInfo?.high_52w}/>

       {/* Footer */}
       <Footer/>

    </>
  );
}
