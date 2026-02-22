import { useEffect, useState } from "react";
// import { getBusinessInsights } from "../services/companyAnalytics.service";

import KpiCard from "./KpiCard";
import SimplePieChart from "./SimplePieChart";
import StoreAOVChart from "./StoreAOVChart";
import BotVsHuman from "./BotVsHuman";
import ProductBundles from "./ProductBundles";
import RecentActivity from "./RecentActivity"; // NEW IMPORT

import styles from "../../styles/business/businessInsights.module.css";

function BusinessInsights() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('aov');
  const [timeRange, setTimeRange] = useState('7d'); // New State for Filter

  // services/companyAnalytics.service.js
  const getBusinessInsights = async () => {
    return {
      // ... keep existing kpis, channelAOV, etc ...
      kpis: {
        aov: 2450,
        botRevenue: 620000,
        bestStore: "Pune FC Road",
        upsellRate: 38
      },
      channelAOV: [
        { channel: "Offline Kiosk (Store)", aov: 2850, type: "kiosk", trend: "+12%" },
        { channel: "Website AI Agent", aov: 2600, type: "ai", trend: "+8%" },
        { channel: "Instagram Agent", aov: 2350, type: "insta", trend: "+5%" },
        { channel: "WhatsApp Bot", aov: 2100, type: "whatsapp", trend: "+3%" },
        { channel: "Online (No AI)", aov: 1900, type: "web", trend: "0%" }
      ],
      // ... keep storeAOV, comparison, bundles ...
      storeAOV: [
        { store: "Pune FC Road", aov: 2450 },
        { store: "Mumbai Andheri", aov: 2200 },
        { store: "Nashik Road", aov: 1800 }
      ],
      comparison: {
        bot: { conversion: 42, aov: 2600, upsell: 45 },
        human: { conversion: 31, aov: 1900, upsell: 22 }
      },
      bundles: [
        { main: "Shirt", addOn: "Belt" },
        { main: "Phone", addOn: "Earbuds" },
        { main: "Shoes", addOn: "Socks" }
      ],

      // --- NEW: LIVE FEED DATA ---
      recentOrders: [
        { id: 101, item: "Premium Jacket", channel: "WhatsApp", time: "2 min ago", value: 4500 },
        { id: 102, item: "Sneakers + Socks", channel: "AI Agent", time: "5 min ago", value: 3200 },
        { id: 103, item: "Cotton Shirt", channel: "Offline", time: "12 min ago", value: 1800 },
        { id: 104, item: "Smart Watch", channel: "Instagram", time: "15 min ago", value: 5500 },
        { id: 105, item: "Denim Jeans", channel: "Website", time: "22 min ago", value: 2100 }
      ]
    };
  };

  useEffect(() => {
    getBusinessInsights().then(setData);
  }, []);

  if (!data) return <p className={styles.loading}>Loading Insights…</p>;

  // Function to render the CORRECT chart type
  const renderActiveChart = () => {
    switch (activeTab) {
      case 'aov': return <div className={styles.chartFadeIn}><SimplePieChart data={data.channelAOV} /></div>;
      case 'bot': return <div className={styles.chartFadeIn}><BotVsHuman data={data.comparison} /></div>;
      case 'store': return <div className={styles.chartFadeIn}><StoreAOVChart data={data.storeAOV} /></div>;
      case 'upsell': return <div className={styles.chartFadeIn}><ProductBundles data={data.bundles} /></div>;
      default: return null;
    }
  };

  return (
    <div className={styles.dashboardContainer}>

      {/* 1. TOP HEADER BAR */}
      <header className={styles.topBar}>
        <div>
          <h1>Overview</h1>
          <p className={styles.dateDisplay}> {new Date().toDateString()} </p>
        </div>
        <div className={styles.controls}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.timeSelect}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className={styles.exportBtn}>📥 Export</button>
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* LEFT COLUMN: CHARTS & KPIS */}
        <div className={styles.leftContent}>

          {/* KPI GRID */}
          <div className={styles.kpiGrid}>
            <KpiCard icon="💰" label="Avg Order Value" value={`₹${data.kpis.aov}`} isSelected={activeTab === 'aov'} onClick={() => setActiveTab('aov')} />
            <KpiCard icon="🤖" label="Bot Revenue" value={`₹${(data.kpis.botRevenue / 100000).toFixed(1)}L`} isSelected={activeTab === 'bot'} onClick={() => setActiveTab('bot')} />
            <KpiCard icon="🏬" label="Top Store" value={data.kpis.bestStore} isSelected={activeTab === 'store'} onClick={() => setActiveTab('store')} />
            <KpiCard icon="📈" label="Upsell Rate" value={`${data.kpis.upsellRate}%`} isSelected={activeTab === 'upsell'} onClick={() => setActiveTab('upsell')} />
          </div>

          {/* DYNAMIC CHART SECTION */}
          <div className={styles.activeChartSection}>
            <div className={styles.sectionHeader}>
              <h3>{activeTab === 'aov' ? 'Channel Distribution' : activeTab === 'bot' ? 'Bot Performance' : activeTab.toUpperCase()}</h3>
              <span className={styles.liveTag}>Live Updates</span>
            </div>
            {renderActiveChart()}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className={styles.rightContent}>
          <RecentActivity orders={data.recentOrders} />

          {/* Example of another sidebar widget */}
          <div className={styles.promoCard}>
            <h4>🚀 AI Agent Status</h4>
            <p>System is <strong>Online</strong> and handling 45 conversations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessInsights;