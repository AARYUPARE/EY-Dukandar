import styles from "../styles/companyStats.module.css";

const StatsCard = ({ title, value }) => {
  return (
    <div className={styles.statsCard}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
};

export default StatsCard;