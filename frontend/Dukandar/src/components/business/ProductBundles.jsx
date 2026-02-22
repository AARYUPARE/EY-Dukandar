import styles from "../../styles/business/businessInsights.module.css";

function ProductBundles({ data }) {
  return (
    <div className={styles.section}>
      <h3>What is Increasing My Order Value?</h3>

      <ul className={styles.bundleList}>
        {data.map((item, i) => (
          <li key={i}>
            {item.main} → <strong>{item.addOn}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductBundles;
