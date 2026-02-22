 import styles from "../../styles/business/businessInsights.module.css";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

function SimplePieChart({ data }) {
  if (!data) return null;
  
  const total = data.reduce((acc, item) => acc + item.aov, 0);
  let currentAngle = 0;
  
  const gradientParts = data.map((item, index) => {
    const percentage = (item.aov / total) * 100;
    const end = currentAngle + percentage;
    const str = `${COLORS[index % COLORS.length]} ${currentAngle}% ${end}%`;
    currentAngle = end;
    return str;
  });

  const gradientString = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className={styles.pieChartContainer}>
      {/* FORCE STYLE: Inline styles guarantee the shape */}
      <div 
        className={styles.pieCircle} 
        style={{ 
          background: gradientString,
          width: '250px', 
          height: '250px', 
          borderRadius: '50%',
          position: 'relative',
          flexShrink: 0 
        }}
      >
        <div className={styles.pieHole}>
          <span>Total AOV</span>
          <strong>₹{Math.round(total / data.length)}</strong>
        </div>
      </div>

      <div className={styles.pieLegend}>
        {data.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <div className={styles.colorDot} style={{ background: COLORS[index % COLORS.length] }} />
            <div className={styles.legendText}>
              <span className={styles.legendLabel}>{item.channel}</span>
              <span className={styles.legendValue}>{Math.round((item.aov / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimplePieChart;