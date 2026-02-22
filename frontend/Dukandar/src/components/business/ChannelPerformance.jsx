import { useEffect, useState } from "react";
import { getChannelInsights } from "../services/companyAnalytics.service";
import styles from "../styles/ChannelPerformance.module.css";

// Helper to get icons/colors based on ID
const getChannelConfig = (id) => {
  switch (id) {
    case "whatsapp": return { icon: "💬", bg: "#dcfce7", color: "#166534" };
    case "instagram": return { icon: "📸", bg: "#fce7f3", color: "#9d174d" };
    case "offline_kiosk": return { icon: "🏪", bg: "#fef3c7", color: "#92400e" };
    case "agent_ai": return { icon: "🤖", bg: "#dbeafe", color: "#1e40af" };
    default: return { icon: "🌐", bg: "#f3f4f6", color: "#374151" };
  }
};

function ChannelPerformance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getChannelInsights().then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  // Calculate Max AOV for relative bar sizing
  const maxAov = Math.max(...data.channels.map(c => c.aov));

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1>Channel AOV Performance</h1>
        <p>Real-time comparison of AI Agents vs. Manual Channels</p>
      </div>

      {/* 1. HERO SECTION: The Winner */}
      <div className={styles.heroCard}>
        <div className={styles.heroContent}>
          <h2>🏆 Top Performer</h2>
          <h3>{data.topPerformer.channel}</h3>
          <p>{data.topPerformer.insight}</p>
        </div>
        <div className={styles.heroStat}>
          <span className={styles.statValue}>₹{data.topPerformer.aov}</span>
          <span className={styles.statLabel}>Average Order Value</span>
        </div>
      </div>

      {/* 2. GRID SECTION: Detailed Cards */}
      <div className={styles.chartGrid}>
        {data.channels.map((channel) => {
          const config = getChannelConfig(channel.id);
          const percentage = (channel.aov / maxAov) * 100;

          return (
            <div key={channel.id} className={styles.channelCard}>
              <div className={styles.cardHeader}>
                {/* Dynamic Icon with Colored Background */}
                <div 
                  className={styles.channelIcon}
                  style={{ backgroundColor: config.bg, color: config.color }}
                >
                  {config.icon}
                </div>
                <span className={styles.tag}>{channel.volume} Vol</span>
              </div>
              
              <div>
                <span style={{color: '#64748b', fontSize: '0.9rem'}}>{channel.label}</span>
                <div className={styles.cardValue}>₹{channel.aov}</div>
              </div>

              {/* Visual Bar Chart */}
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBar} 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: channel.color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChannelPerformance;