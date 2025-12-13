import { useMemo, useState } from "react";
import css from "../styles/Sales.module.css";
import { IoArrowBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { div } from "three/src/nodes/TSL.js";

/*
  Usage:
    <Sales />
  Replace `sampleSales` with your backend data or fetch in useEffect.
*/

const sampleSales = [
  { id: 1, grn: "GRN101", title: "Virat Kohli Shirt", qty: 2, price: 499, ts: "2025-12-08T09:12:00Z" },
  { id: 2, grn: "GRN205", title: "Laptop", qty: 1, price: 45000, ts: "2025-12-07T14:22:00Z" },
  { id: 3, grn: "GRN101", title: "Virat Kohli Shirt", qty: 1, price: 499, ts: "2025-12-07T16:11:00Z" },
  { id: 4, grn: "GRN334", title: "Shoes", qty: 3, price: 2499, ts: "2025-12-01T10:00:00Z" },
  { id: 5, grn: "GRN599", title: "Headset", qty: 4, price: 799, ts: "2025-12-08T07:50:00Z" },
  { id: 6, grn: "GRN412", title: "SSD 256GB", qty: 5, price: 1999, ts: "2025-09-05T09:00:00Z" }
];

function startOfPeriod(period) {
  const now = new Date();
  if (period === "daily") { const d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (period === "weekly") { const d = new Date(now); d.setDate(d.getDate()-6); d.setHours(0,0,0,0); return d; }
  if (period === "monthly") { const d = new Date(now); d.setMonth(d.getMonth()-1); d.setHours(0,0,0,0); return d; }
  if (period === "yearly") { const d = new Date(now); d.setFullYear(d.getFullYear()-1); d.setHours(0,0,0,0); return d; }
  return new Date(0);
}

function exportCsv(rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? "";
      const text = typeof v === "string" ? v.replace(/"/g, '""') : String(v);
      return `"${text}"`;
    }).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sales_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Sales() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("daily"); // daily|weekly|monthly|yearly
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "revenue", dir: "desc" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // aggregate sampleSales into per-GRN sums but only include sales after period start
  const start = useMemo(() => startOfPeriod(period), [period]);
  const aggregated = useMemo(() => {
    const t0 = start.getTime();
    const arr = sampleSales.filter(s => new Date(s.ts).getTime() >= t0);
    const map = new Map();
    for (const s of arr) {
      const key = s.grn;
      const prev = map.get(key) ?? { grn: s.grn, title: s.title, qty: 0, revenue: 0, lastSold: 0 };
      prev.qty += Number(s.qty);
      prev.revenue += Number(s.qty) * Number(s.price ?? 0);
      prev.lastSold = Math.max(prev.lastSold, new Date(s.ts).getTime());
      map.set(key, prev);
    }
    return Array.from(map.values()).map(r => ({ ...r, lastSold: r.lastSold ? new Date(r.lastSold).toISOString() : null }));
  }, [start]);

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    const arr = aggregated.filter(it => {
      if (!q) return true;
      return String(it.grn).toLowerCase().includes(q) || (it.title ?? "").toLowerCase().includes(q);
    });

    const sorted = arr.sort((a,b) => {
      const k = sortBy.key;
      const av = a[k] ?? 0;
      const bv = b[k] ?? 0;
      if (typeof av === "number" && typeof bv === "number") return sortBy.dir === "asc" ? av - bv : bv - av;
      return sortBy.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return sorted;
  }, [aggregated, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function toggleSort(key) {
    setSortBy(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });
  }

  return (
    <div className={css.wrapperContainer}>
    <div className={css.wrapper}>
      <button className={css.backBtn} onClick={() => navigate("../")}>
        <IoArrowBackCircle size={34} />
      </button>

      <div className={css.headerRow}>
        <h3 className={css.title}>Sales Overview</h3>

        <div className={css.controls}>
          <div className={css.segment}>
            <button className={period === "daily" ? css.activeSegment : ""} onClick={() => { setPeriod("daily"); setPage(1); }}>Daily</button>
            <button className={period === "weekly" ? css.activeSegment : ""} onClick={() => { setPeriod("weekly"); setPage(1); }}>Weekly</button>
            <button className={period === "monthly" ? css.activeSegment : ""} onClick={() => { setPeriod("monthly"); setPage(1); }}>Monthly</button>
            <button className={period === "yearly" ? css.activeSegment : ""} onClick={() => { setPeriod("yearly"); setPage(1); }}>Yearly</button>
          </div>

          <input
            className={css.search}
            placeholder="Search GRN or item..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />

          <button className={css.exportBtn} onClick={() => exportCsv(filtered)}>Export CSV</button>
        </div>
      </div>

      <div className={css.tableWrap}>
        <table className={css.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort("grn")}>GRN <span className={css.sort}>{sortBy.key === "grn" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("title")}>Item <span className={css.sort}>{sortBy.key === "title" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("qty")}>Qty Sold <span className={css.sort}>{sortBy.key === "qty" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("revenue")}>Revenue <span className={css.sort}>{sortBy.key === "revenue" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("lastSold")}>Last Sold</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr><td colSpan="5" className={css.empty}>No sales in this period</td></tr>
            ) : (
              pageItems.map(it => (
                <tr key={it.grn}>
                  <td className={css.center}>{it.grn}</td>
                  <td>{it.title}</td>
                  <td className={css.center}>{it.qty}</td>
                  <td className={css.center}>₹{Number(it.revenue ?? 0).toLocaleString()}</td>
                  <td className={css.center}>{it.lastSold ? new Date(it.lastSold).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={css.footerRow}>
        <div className={css.pageInfo}>Showing {filtered.length === 0 ? 0 : (page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage, filtered.length)} of {filtered.length}</div>
        <div className={css.pager}>
          <button className={css.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className={css.pageBtn} onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
          <span className={css.pageNumber}>{page}/{totalPages}</span>
          <button className={css.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>›</button>
          <button className={css.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      </div>
    </div>
    </div>
  );
}
