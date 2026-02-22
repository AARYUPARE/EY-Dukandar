// component/RecentActivity.jsx
import styles from "../../styles/business/businessInsights.module.css";

function RecentActivity({ orders }) {
  if (!orders) return null;

  const getBadgeColor = (channel) => {
    if (channel.includes("AI")) return "#eff6ff"; // Blue
    if (channel.includes("WhatsApp")) return "#f0fdf4"; // Green
    if (channel.includes("Instagram")) return "#fdf4ff"; // Pink
    return "#f3f4f6"; // Gray
  };

  return (
    <div className={styles.activityCard}>
      <div className={styles.activityHeader}>
        <h3>⚡ Live Activity</h3>
        <span className={styles.liveDot}>• Live</span>
      </div>
      
      <div className={styles.feedList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.feedItem}>
            <div className={styles.feedIcon} style={{background: getBadgeColor(order.channel)}}>
              {order.channel[0]}
            </div>
            <div className={styles.feedContent}>
              <p className={styles.feedTitle}>
                <strong>{order.item}</strong> via {order.channel}
              </p>
              <span className={styles.feedTime}>{order.time}</span>
            </div>
            <div className={styles.feedValue}>+₹{order.value}</div>
          </div>
        ))}
      </div>
      
      <button className={styles.viewAllBtn}>View All Orders →</button>
    </div>
  );
}

export default RecentActivity;