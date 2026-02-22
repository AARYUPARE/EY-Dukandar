 // components/ChannelAOVChart.jsx
import styles from "../styles/businessInsights.module.css";

function ChannelAOVChart({ data }) {
  // 1. Find the highest value to calculate bar width relative to 100%
  const maxVal = Math.max(...data.map((d) => d.aov));

  // 2. Helper to get styles based on channel type
  const getChannelStyle = (type) => {
    switch (type) {
      case "kiosk":
        return { icon: "🏪", color: "#f59e0b", bg: "#fffbeb", label: "Kiosk (Offline)" }; // Gold
      case "ai":
        return { icon: "🤖", color: "#3b82f6", bg: "#eff6ff", label: "AI Agent" }; // Blue
      case "whatsapp":
        return { icon: "💬", color: "#22c55e", bg: "#f0fdf4", label: "WhatsApp" }; // Green
      case "insta":
        return { icon: "📸", color: "#d946ef", bg: "#fdf4ff", label: "Instagram" }; // Pink
      default:
        return { icon: "🌐", color: "#6b7280", bg: "#f9fafb", label: "Web Organic" }; // Gray
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.chartHeader}>
        <h3>Channel AOV Leaderboard</h3>
        <span className={styles.subtitle}>Which source drives the highest value?</span>
      </div>

      <div className={styles.chartContainer}>
        {data.map((item, i) => {
          const style = getChannelStyle(item.type);
          const widthPercent = (item.aov / maxVal) * 100;
          const isWinner = i === 0; // Assuming data comes sorted or is the top one

          return (
            <div key={i} className={styles.channelRow}>
              
              {/* Left Side: Icon & Name */}
              <div className={styles.channelInfo}>
                <div className={styles.iconBox} style={{ backgroundColor: style.bg }}>
                  <span style={{ fontSize: "1.2rem" }}>{style.icon}</span>
                </div>
                <div>
                  <span className={styles.channelName}>
                    {item.channel}
                    {isWinner && <span className={styles.winnerBadge}>🏆 Best</span>}
                  </span>
                  <span className={styles.trendLabel}>{item.trend} vs last month</span>
                </div>
              </div>

              {/* Right Side: Bar & Value */}
              <div className={styles.barArea}>
                <div className={styles.valueLabel}>₹{item.aov.toLocaleString()}</div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: style.color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChannelAOVChart;