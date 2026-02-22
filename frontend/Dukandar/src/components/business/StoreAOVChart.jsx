import styles from "../../styles/business/businessInsights.module.css";

function StoreAOVChart({ data }) {
  return (
    <div className={styles.section}>
      <h3>Store Performance</h3>

      {data.map((item, i) => (
        <div key={i} className={styles.barRow}>
          <span>{item.store}</span>
          <div className={styles.bar}>
            <div
              className={styles.barFillAlt}
              style={{ width: `${item.aov / 30}%` }}
            >
              ₹{item.aov}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StoreAOVChart;
