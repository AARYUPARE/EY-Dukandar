 import styles from "../../styles/business/businessInsights.module.css";

function BotVsHuman({ data }) {
  if (!data) return <div>No Data Available</div>;

  const maxVal = 100; // Percentage base

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.comparisonHeader}>
        <div className={styles.legendItem}>
          <div className={styles.colorDot} style={{background: '#3b82f6'}}></div> AI Bot
        </div>
        <div className={styles.legendItem}>
           <div className={styles.colorDot} style={{background: '#9ca3af'}}></div> Human
        </div>
      </div>

      <div className={styles.compareRow}>
        <p>Conversion Rate</p>
        <div className={styles.doubleBar}>
          <div className={styles.barGroup}>
            <div style={{width: `${data.bot.conversion}%`}} className={styles.botBar}>
              {data.bot.conversion}%
            </div>
            <div style={{width: `${data.human.conversion}%`}} className={styles.humanBar}>
              {data.human.conversion}%
            </div>
          </div>
        </div>
      </div>

      <div className={styles.compareRow}>
        <p>Upsell Success Rate</p>
        <div className={styles.doubleBar}>
          <div className={styles.barGroup}>
            <div style={{width: `${data.bot.upsell}%`}} className={styles.botBar}>
              {data.bot.upsell}%
            </div>
            <div style={{width: `${data.human.upsell}%`}} className={styles.humanBar}>
              {data.human.upsell}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotVsHuman;