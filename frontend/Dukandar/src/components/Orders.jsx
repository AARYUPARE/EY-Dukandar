import { useEffect, useMemo, useState } from "react";
import css from "../styles/Orders.module.css";
import axios from "axios"
import {useSelector} from "react-redux"
import { BASE_BACKEND_URL } from "../store/store";

/*
  Frontend-only order history component.
  Replace sampleOrders with backend data or fetch in useEffect.
*/

const sampleOrders = [
  {
    id: "ORD-1001",
    placedAt: "2025-12-01T09:10:00Z",
    deliveryAt: "2025-12-03T12:00:00Z",
    status: "Delivered",
    items: [{ grn: "GRN101", title: "Sports Shoes", qty: 1, price: 2999 }]
  },
  {
    id: "ORD-1002",
    placedAt: "2025-12-02T10:20:00Z",
    deliveryAt: "2025-12-06T15:00:00Z",
    status: "Shipped",
    items: [{ grn: "GRN102", title: "Gaming Mouse", qty: 2, price: 899 }]
  },
  {
    id: "ORD-1003",
    placedAt: "2025-12-03T08:30:00Z",
    deliveryAt: "2025-12-07T16:00:00Z",
    status: "Packed",
    items: [{ grn: "GRN103", title: "Mechanical Keyboard", qty: 1, price: 3499 }]
  },
  {
    id: "ORD-1004",
    placedAt: "2025-12-04T11:15:00Z",
    deliveryAt: "2025-12-08T18:00:00Z",
    status: "Placed",
    items: [{ grn: "GRN104", title: "Backpack", qty: 1, price: 1299 }]
  },
  {
    id: "ORD-1005",
    placedAt: "2025-12-05T13:40:00Z",
    deliveryAt: "2025-12-10T12:00:00Z",
    status: "Cancelled",
    items: [{ grn: "GRN105", title: "Bluetooth Speaker", qty: 1, price: 1999 }]
  },
  {
    id: "ORD-1006",
    placedAt: "2025-12-06T14:00:00Z",
    deliveryAt: "2025-12-09T12:00:00Z",
    status: "Delivered",
    items: [{ grn: "GRN106", title: "SSD 512GB", qty: 1, price: 4599 }]
  },
  {
    id: "ORD-1007",
    placedAt: "2025-12-07T09:50:00Z",
    deliveryAt: "2025-12-11T12:00:00Z",
    status: "Shipped",
    items: [{ grn: "GRN107", title: "Laptop Stand", qty: 1, price: 999 }]
  },
  {
    id: "ORD-1008",
    placedAt: "2025-12-08T07:25:00Z",
    deliveryAt: "2025-12-13T12:00:00Z",
    status: "Placed",
    items: [{ grn: "GRN108", title: "USB Hub", qty: 3, price: 399 }]
  },
  {
    id: "ORD-1009",
    placedAt: "2025-12-09T12:10:00Z",
    deliveryAt: "2025-12-14T12:00:00Z",
    status: "Packed",
    items: [{ grn: "GRN109", title: "Power Bank", qty: 2, price: 1099 }]
  },
  {
    id: "ORD-1010",
    placedAt: "2025-12-10T15:30:00Z",
    deliveryAt: "2025-12-16T12:00:00Z",
    status: "Delivered",
    items: [{ grn: "GRN110", title: "Smart Watch", qty: 1, price: 5999 }]
  },
  {
    id: "ORD-1011",
    placedAt: "2025-12-11T16:00:00Z",
    deliveryAt: "2025-12-17T12:00:00Z",
    status: "Shipped",
    items: [{ grn: "GRN111", title: "T-Shirt Pack", qty: 3, price: 499 }]
  },
  {
    id: "ORD-1012",
    placedAt: "2025-12-12T10:45:00Z",
    deliveryAt: "2025-12-18T12:00:00Z",
    status: "Delivered",
    items: [{ grn: "GRN112", title: "Desk Lamp", qty: 1, price: 899 }]
  },
  {
    id: "ORD-1013",
    placedAt: "2025-12-13T09:15:00Z",
    deliveryAt: "2025-12-19T12:00:00Z",
    status: "Placed",
    items: [{ grn: "GRN113", title: "Notebook Set", qty: 5, price: 199 }]
  },
  {
    id: "ORD-1014",
    placedAt: "2025-12-14T12:35:00Z",
    deliveryAt: "2025-12-20T12:00:00Z",
    status: "Packed",
    items: [{ grn: "GRN114", title: "Headphones", qty: 1, price: 2499 }]
  },
  {
    id: "ORD-1015",
    placedAt: "2025-12-15T18:00:00Z",
    deliveryAt: "2025-12-22T12:00:00Z",
    status: "Delivered",
    items: [{ grn: "GRN115", title: "Office Chair", qty: 1, price: 7999 }]
  },
  {
    id: "ORD-1016",
    placedAt: "2025-12-16T11:20:00Z",
    deliveryAt: "2025-12-23T12:00:00Z",
    status: "Cancelled",
    items: [{ grn: "GRN116", title: "Tablet Cover", qty: 1, price: 599 }]
  },
  {
    id: "ORD-1017",
    placedAt: "2025-12-17T08:10:00Z",
    deliveryAt: "2025-12-24T12:00:00Z",
    status: "Shipped",
    items: [{ grn: "GRN117", title: "Monitor 24inch", qty: 1, price: 10499 }]
  },
  {
    id: "ORD-1018",
    placedAt: "2025-12-18T14:50:00Z",
    deliveryAt: "2025-12-25T12:00:00Z",
    status: "Packed",
    items: [{ grn: "GRN118", title: "Webcam", qty: 1, price: 1799 }]
  },
  {
    id: "ORD-1019",
    placedAt: "2025-12-19T17:40:00Z",
    deliveryAt: "2025-12-26T12:00:00Z",
    status: "Placed",
    items: [{ grn: "GRN119", title: "Router", qty: 1, price: 2299 }]
  },
  {
    id: "ORD-1020",
    placedAt: "2025-12-20T19:00:00Z",
    deliveryAt: "2025-12-27T12:00:00Z",
    status: "Delivered",
    items: [{ grn: "GRN120", title: "External HDD 1TB", qty: 1, price: 5499 }]
  }
];

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function Orders() {

  const [orders, setOrders] = useState(sampleOrders);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "placedAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const user = useSelector(store => store.user)

  useEffect(() => {
  if (user.id === -1) return;

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_BACKEND_URL}/order/user/${user.id}`);
      setOrders(res.data);
      console.log("Orders From Backend:", res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  fetchOrders();
}, [user.id]);

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
                      <button className="btn btn-sm" style={{ background: "#ccff01", color: "#0a0e19", border: "2px solid #0a0e19" }} onClick={() => setViewOrder(o)}>View Order</button>
                      <button className="btn btn-outline-light btn-sm" style={{ marginLeft: 8, background: "#f6f6f6", color: "#0a0e19", border: "2px solid #0a0e19" }} onClick={() => setTrackOrder(o)}>Track Order</button>
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
