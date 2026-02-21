import { useMemo, useState } from "react";
import css from "../styles/Sales.module.css";

const sampleSales = [
  { id: 1, grn: "GRN101", title: "Virat Kohli Shirt", qty: 2, price: 499, ts: "2025-12-08T09:12:00Z" },
  { id: 2, grn: "GRN205", title: "Laptop", qty: 1, price: 45000, ts: "2025-12-07T14:22:00Z" },
];

function startOfPeriod(period) {
  const now = new Date();
  if (period === "daily") { const d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (period === "weekly") { const d = new Date(now); d.setDate(d.getDate()-6); d.setHours(0,0,0,0); return d; }
  if (period === "monthly") { const d = new Date(now); d.setMonth(d.getMonth()-1); d.setHours(0,0,0,0); return d; }
  if (period === "yearly") { const d = new Date(now); d.setFullYear(d.getFullYear()-1); d.setHours(0,0,0,0); return d; }
  return new Date(0);
}

export default function Sales() {
  const [period, setPeriod] = useState("daily");
  const [query, setQuery] = useState("");

  const start = useMemo(() => startOfPeriod(period), [period]);

  const rows = useMemo(() => {
    const map = new Map();
    sampleSales
      .filter(s => new Date(s.ts) >= start)
      .forEach(s => {
        const prev = map.get(s.grn) ?? { grn: s.grn, title: s.title, qty: 0, revenue: 0 };
        prev.qty += s.qty;
        prev.revenue += s.qty * s.price;
        map.set(s.grn, prev);
      });
    return Array.from(map.values());
  }, [start]);

  const filtered = rows.filter(r =>
    r.grn.toLowerCase().includes(query.toLowerCase()) ||
    r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={css.wrapper}>
      <h2 className={css.pageTitle}>Sales Overview</h2>

      <div className={css.topBar}>
        <div className={css.segment}>
          {["daily","weekly","monthly","yearly"].map(p => (
            <button
              key={p}
              className={period === p ? css.active : ""}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>

        <input
          className={css.search}
          placeholder="Search GRN or item..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className={css.tableWrap}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>GRN</th>
              <th>Item</th>
              <th>Qty Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className={css.empty}>No sales in this period</td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.grn}>
                  <td>{r.grn}</td>
                  <td>{r.title}</td>
                  <td>{r.qty}</td>
                  <td>₹{r.revenue.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}