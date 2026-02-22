 import styles from "../../styles/business/businessInsights.module.css";
import AnimatedCounter from "./AnimatedCounter";

function KpiCard({ icon, label, value, onClick, isSelected }) {
  
  // Helper to safely check if the value is a number we can animate
  const formatValue = (valStr) => {
    const str = String(valStr);
    // Remove non-numeric characters to find the raw number
    const cleaned = str.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    
    // Check if the result is actually a valid number
    const isValidNumber = !isNaN(num) && cleaned !== "";

    // Extract prefix/suffix (e.g. "₹" or "%")
    const prefix = str.includes("₹") ? "₹" : "";
    const suffix = str.includes("%") ? "%" : "";
    
    return { num, prefix, suffix, isValidNumber };
  };

  const { num, prefix, suffix, isValidNumber } = formatValue(value);

  return (
    <div 
      className={`${styles.kpiCard} ${isSelected ? styles.selectedCard : ''}`} 
      onClick={onClick}
    >
      <div style={{width: '100%'}}>
         <span className={styles.kpiIcon}>{icon}</span>
         <p>{label}</p>
         <h2>
           {/* LOGIC: If it's a number, animate it. If it's text, just show it. */}
           {isValidNumber ? (
             <AnimatedCounter end={num} prefix={prefix} suffix={suffix} duration={1000} />
           ) : (
             <span>{value}</span> 
           )}
         </h2>
      </div>
      
      <div className={styles.clickHint}>View Graph 📉</div>
    </div>
  );
}

export default KpiCard;