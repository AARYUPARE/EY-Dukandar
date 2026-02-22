import { useEffect, useState } from "react";
import { getCompanyStats } from "../services/companyAnalytics.service";

import StatsCard from "./StatsCard";
import StoreAOVChart from "./StoreAOVChart";
import ChannelAOVChart from "./ChannelAOVChart";

import styles from "../styles/companyStats.module.css";

function CompanyStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCompanyStats().then(setStats);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className={styles.companyStats}>
      <h1>Company Analytics</h1>

      <div className={styles.cards}>
        <StatsCard title="Highest AOV Store" value={stats.highestAOVStore} />
        <StatsCard title="Best Channel" value={stats.bestChannel} />
        <StatsCard title="Bot AOV Increase" value={`+${stats.botAOVIncrease}%`} />
      </div>

      <div className={styles.charts}>
        <StoreAOVChart data={stats.storeAOV} />
        <ChannelAOVChart data={stats.channelAOV} />
      </div>
    </div>
  );
}

export default CompanyStats;