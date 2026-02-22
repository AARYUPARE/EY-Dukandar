import styles from "../styles/businessInsights.module.css";

function ConversionFunnel() {
  const stages = [
    { label: "Website Visitors", value: "12,500", width: "100%", color: "#3b82f6" },
    { label: "Engaged with Bot", value: "6,200", width: "80%", color: "#6366f1" },
    { label: "Added to Cart", value: "1,800", width: "60%", color: "#8b5cf6" },
    { label: "Purchased", value: "450", width: "40%", color: "#ec4899" }
  ];

  return (
    <div className={styles.funnelCard}>
      <h3>🔻 Customer Conversion Funnel</h3>
      <div className={styles.funnelContainer}>
        {stages.map((stage, i) => (
          <div key={i} className={styles.funnelRow}>
            {/* The Label Left */}
            <div className={styles.funnelLabel}>
              <span>{stage.label}</span>
              <small>{stage.value}</small>
            </div>
            
            {/* The Funnel Bar */}
            <div className={styles.funnelBarArea}>
              <div 
                className={styles.funnelBar} 
                style={{ 
                  width: stage.width, 
                  background: `linear-gradient(90deg, ${stage.color} 0%, rgba(255,255,255,0.2) 100%)`,
                  boxShadow: `0 4px 15px ${stage.color}40`
                }}
              >
                {/* Connector Line (except for last item) */}
                {i !== stages.length - 1 && <div className={styles.funnelConnector}></div>}
              </div>
            </div>
            
            {/* Conversion % (Fake calculation for demo) */}
            <div className={styles.funnelPercent}>
               {i === 0 ? "100%" : "⬇ 40%"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversionFunnel;