import { useMemo, useState } from "react";
import css from "../styles/Orders.module.css";

/*
  Frontend-only order history component.
  Replace sampleOrders with backend data or fetch in useEffect.
*/

const sampleOrders = [
  {
    id: "ORD-1001",
    placedAt: "2025-12-08T09:12:00Z",
    deliveryAt: "2025-12-12T12:00:00Z",
    status: "Shipped",
    items: [
      { grn: "GRN101", title: "Virat Kohli Shirt", qty: 1, price: 499 },
      { grn: "GRN599", title: "Headset", qty: 1, price: 799 }
    ]
  },
  {
    id: "ORD-1002",
    placedAt: "2025-12-07T13:22:00Z",
    deliveryAt: "2025-12-09T17:00:00Z",
    status: "Delivered",
    items: [
      { grn: "GRN205", title: "Laptop", qty: 1, price: 45000 }
    ]
  },
  {
    id: "ORD-1003",
    placedAt: "2025-12-01T10:00:00Z",
    deliveryAt: "2025-12-06T14:00:00Z",
    status: "Delivered",
    items: [
      { grn: "GRN334", title: "Shoes", qty: 2, price: 2499 },
      { grn: "GRN412", title: "SSD 256GB", qty: 1, price: 1999 }
    ]
  },
  {
    id: "ORD-1004",
    placedAt: "2025-11-30T08:00:00Z",
    deliveryAt: "2025-12-04T10:00:00Z",
    status: "Cancelled",
    items: [
      { grn: "GRN599", title: "Headset", qty: 1, price: 799 }
    ]
  }
];

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function Orders() {
  const [orders] = useState(sampleOrders);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "placedAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const [viewOrder, setViewOrder] = useState(null); // order object
  const [trackOrder, setTrackOrder] = useState(null); // order object

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    const arr = orders.filter((o) => {
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.status ?? "").toLowerCase().includes(q) ||
        formatDate(o.placedAt).toLowerCase().includes(q)
      );
    }).slice();

    arr.sort((a, b) => {
      const k = sortBy.key;
      const av = a[k] ?? "";
      const bv = b[k] ?? "";
      if (k === "amount") {
        const sa = a.items.reduce((s, it) => s + (it.qty * it.price), 0);
        const sb = b.items.reduce((s, it) => s + (it.qty * it.price), 0);
        return sortBy.dir === "asc" ? sa - sb : sb - sa;
      }
      if (k === "placedAt" || k === "deliveryAt") {
        const ta = new Date(av).getTime() || 0;
        const tb = new Date(bv).getTime() || 0;
        return sortBy.dir === "asc" ? ta - tb : tb - ta;
      }
      return sortBy.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return arr;
  }, [orders, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function toggleSort(key) {
    setSortBy((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  function exportCsv(rows) {
    if (!rows || rows.length === 0) return;
    const headers = ["orderId", "placedAt", "deliveryAt", "status", "amount"];
    const csv = [
      headers.join(","),
      ...rows.map((r) => {
        const amount = r.items.reduce((s, it) => s + it.qty * it.price, 0);
        return [
          `"${r.id}"`,
          `"${formatDate(r.placedAt)}"`,
          `"${formatDate(r.deliveryAt)}"`,
          `"${r.status}"`,
          `"${amount}"`
        ].join(",");
      })
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={css.wrapper}>
      <div className={css.headerRow}>
        <h3 className={css.title}>Order History</h3>

        <div className={css.controls}>
          <input
            className={css.search}
            placeholder="Search by order ID, status or date..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
          <button className={css.exportBtn} onClick={() => exportCsv(filtered)}>Export CSV</button>
        </div>
      </div>

      <div className={css.tableWrap}>
        <table className={css.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort("id")}>Order ID <span className={css.sort}>{sortBy.key === "id" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("placedAt")}>Order Date <span className={css.sort}>{sortBy.key === "placedAt" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("deliveryAt")}>Delivery Date <span className={css.sort}>{sortBy.key === "deliveryAt" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("amount")}>Amount <span className={css.sort}>{sortBy.key === "amount" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th onClick={() => toggleSort("status")}>Status <span className={css.sort}>{sortBy.key === "status" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span></th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr><td colSpan="6" className={css.empty}>No orders found</td></tr>
            ) : (
              pageItems.map((o) => {
                const amount = o.items.reduce((s, it) => s + it.qty * it.price, 0);
                return (
                  <tr key={o.id}>
                    <td className={css.center}>{o.id}</td>
                    <td>{formatDate(o.placedAt)}</td>
                    <td>{formatDate(o.deliveryAt)}</td>
                    <td className={css.center}>₹{amount.toLocaleString()}</td>
                    <td className={css.center}>
                      <span className={`${css.status} ${css[o.status?.toLowerCase() ?? ""]}`}>{o.status}</span>
                    </td>
                    <td className={css.actions}>
                      <button className="btn btn-sm" style={{ background: "linear-gradient(90deg,#8e24ff,#39e6ff)", color: "#001219" }} onClick={() => setViewOrder(o)}>View Order</button>
                      <button className="btn btn-outline-light btn-sm" style={{ marginLeft: 8 }} onClick={() => setTrackOrder(o)}>Track Order</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={css.footerRow}>
        <div className={css.pageInfo}>Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}</div>

        <div className={css.pager}>
          <button className={css.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className={css.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          <span className={css.pageNumber}>{page}/{totalPages}</span>
          <button className={css.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button className={css.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {viewOrder && (
        <div className={css.modalWrap} role="dialog">
          <div className={css.backdrop} onClick={() => setViewOrder(null)}></div>
          <div className={css.modal}>
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <h5>Order {viewOrder.id}</h5>
                <button className="btn-close" onClick={() => setViewOrder(null)} />
              </div>

              <p className="text-muted small">Placed: {formatDate(viewOrder.placedAt)} • Delivery: {formatDate(viewOrder.deliveryAt)}</p>

              <div className={css.itemsTableWrap}>
                <table className="table table-dark">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className={css.center}>Qty</th>
                      <th className={css.center}>Price</th>
                      <th className={css.center}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items.map((it, i) => (
                      <tr key={i}>
                        <td>{it.title} <div className="text-muted small">GRN: {it.grn}</div></td>
                        <td className={css.center}>{it.qty}</td>
                        <td className={css.center}>₹{it.price.toLocaleString()}</td>
                        <td className={css.center}>₹{(it.qty * it.price).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total</strong></td>
                      <td className={css.center}><strong>₹{viewOrder.items.reduce((s, it) => s + it.qty * it.price, 0).toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end">
                <button className="btn btn-outline-light" onClick={() => setViewOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRACK ORDER MODAL */}
      {trackOrder && (
        <div className={css.modalWrap} role="dialog">
          <div className={css.backdrop} onClick={() => setTrackOrder(null)}></div>
          <div className={css.modal}>
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <h5>Track {trackOrder.id}</h5>
                <button className="btn-close" onClick={() => setTrackOrder(null)} />
              </div>

              <div className={css.trackSteps}>
                {/* Steps: Placed -> Packed -> Shipped -> Delivered */}
                {["Placed","Packed","Shipped","Delivered"].map((step, idx) => {
                  const statusIndex = ["Placed","Packed","Shipped","Delivered"].indexOf(trackOrder.status ?? "Placed");
                  const done = idx <= statusIndex;
                  return (
                    <div key={step} className={`${css.step} ${done ? css.done : ""}`}>
                      <div className={css.stepDot}>{idx+1}</div>
                      <div className={css.stepLabel}>{step}</div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-outline-light" onClick={() => setTrackOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
