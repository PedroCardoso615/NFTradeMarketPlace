import React, { useState, useEffect } from "react";

const TopCreators = () => {
  const [timeFrame, setTimeFrame] = useState("24h");
  const [topCreators, setTopCreators] = useState([]);

  useEffect(() => {
    const fetchTopCreators = async () => {
      try {
        const response = await fetch(`/top-creators/${timeFrame}`);
        const data = await response.json();
        if (response.ok) {
          setTopCreators(data);
        } else {
          console.error("Failed to fetch top creators:", data);
        }
      } catch (error) {
        console.error("Error fetching top creators:", error);
      }
    };

    fetchTopCreators();
  }, [timeFrame]);

  return (
    <div>
      <div className="timeframe-buttons">
        <button onClick={() => setTimeFrame("24h")} className={timeFrame === "24h" ? "active" : ""}>
          24h
        </button>
        <button onClick={() => setTimeFrame("7d")} className={timeFrame === "7d" ? "active" : ""}>
          7d
        </button>
        <button onClick={() => setTimeFrame("30d")} className={timeFrame === "30d" ? "active" : ""}>
          30d
        </button>
      </div>

      <div className="top-creators-list">
        {topCreators.length > 0 ? (
          topCreators.map((creator, index) => (
            <div key={index} className="creator-card">
              <h3>{creator.name}</h3>
              <p>{creator.nftsCreated} NFTs Created</p>
            </div>
          ))
        ) : (
          <p>No creators found</p>
        )}
      </div>
    </div>
  );
};

export default TopCreators;