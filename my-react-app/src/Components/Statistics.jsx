import React from "react";

export default function Statistics({ market_cap, pe_ratio, low_5w, high_5w }){
    return <>
    <div className="key">
  <h3 className="heading2">Key Statistics</h3>
  <div className="stats-box">
    <div className="top">
      <div className="box1">
          <p className="head">Market Cap</p>
            <p>${market_cap}</p>
      </div>
      <div className="box2">
      <p className="head">P/E Ratio</p>
          <p>{pe_ratio}</p>
      </div>
    </div>
    <div className="bottom">
        <div className="box3">
        <p className="head">52W High</p>
          <p>${low_5w}</p>
        </div>
        <div className="box4">
        <p className="head">52W Low</p>
          <p>${high_5w}</p>
        </div>
    </div>
  </div>
  </div>
    </>
}