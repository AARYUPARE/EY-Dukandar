import { useEffect, useMemo, useState } from "react";
import css from "../styles/SaleProduct.module.css";

export default function SaleProduct({ items: initialItems, onSell }) {
  const sample = [
    { grn: "GRN101", title: "Virat Kohli Shirt", quantity: 12, price: 499, specifications: "Size:M;Color:White" },
    { grn: "GRN205", title: "Laptop", quantity: 5, price: 45000, specifications: "16GB RAM;512GB SSD" },
    { grn: "GRN334", title: "Shoes", quantity: 8, price: 2499, specifications: "Size:9;Black" },
    { grn: "GRN412", title: "SSD 256GB", quantity: 2, price: 1999, specifications: "SATA" }
  ];

  const [items, setItems] = useState(Array.isArray(initialItems) && initialItems.length ? initialItems : sample);
  useEffect(() => {
    if (Array.isArray(initialItems) && initialItems.length) setItems(initialItems);
  }, [initialItems]);

  const [query, setQuery] = useState("");
  const [selectedGrn, setSelectedGrn] = useState("");
  const selectedItem = useMemo(() => items.find(i => i.grn === selectedGrn) ?? null, [items, selectedGrn]);

  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [selling, setSelling] = useState(false);
  const [history, setHistory] = useState([]);

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => String(i.grn).toLowerCase().includes(q) || (i.title ?? "").toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    setError("");
    setQty("");
  }, [selectedGrn]);

  function validate() {
    if (!selectedItem) return "Select an item to sell";
    if (!String(qty).trim()) return "Enter quantity";
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return "Quantity must be a positive number";
    if (n > (selectedItem.quantity ?? 0)) return `Insufficient stock. Available: ${selectedItem.quantity}`;
    return "";
  }

  async function handleSell(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSelling(true);
    const payload = {
      grn: selectedItem.grn,
      title: selectedItem.title,
      quantity: Number(qty),
      pricePerItem: Number(selectedItem.price ?? 0),
      total: Number(qty) * Number(selectedItem.price ?? 0),
      timestamp: new Date().toISOString()
    };
    try {
      if (onSell) {
        const maybePromise = onSell(payload);
        if (maybePromise && typeof maybePromise.then === "function") await maybePromise;
      }
      setItems(prev => prev.map(it => it.grn === selectedItem.grn ? { ...it, quantity: (it.quantity ?? 0) - Number(qty) } : it));
      setHistory(h => [{ ...payload }, ...h]);
      setQty("");
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to process sale");
    } finally {
      setSelling(false);
    }
  }

  return (
    <div className={`container-fluid p-3 ${css.root}`}>
      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h5 className="card-title">Sell Product</h5>

              <div className="mb-3">
                <label className="form-label">Search item (GRN or name)</label>
                <input className="form-control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />
              </div>

              <div className="mb-3">
                <label className="form-label">Select item</label>
                <select className="form-select" value={selectedGrn} onChange={e => setSelectedGrn(e.target.value)}>
                  <option value="">-- choose an item --</option>
                  {filtered.map(it => (
                    <option key={it.grn} value={it.grn}>
                      {it.grn} — {it.title} ({it.quantity ?? 0} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Price per item</label>
                <input className="form-control" readOnly value={selectedItem ? `₹${Number(selectedItem.price ?? 0).toLocaleString()}` : ""} />
              </div>

              <div className="mb-3 row g-2">
                <div className="col">
                  <label className="form-label">Quantity to sell</label>
                  <input type="number" min="1" className="form-control" value={qty} onChange={e => setQty(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label">Total</label>
                  <input className="form-control" readOnly value={selectedItem ? `₹${(Number(selectedItem.price ?? 0) * Number(qty || 0)).toLocaleString()}` : ""} />
                </div>
              </div>

              {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={() => { setSelectedGrn(""); setQty(""); setError(""); }}>Reset</button>
                <button className="btn btn-primary ms-auto" onClick={handleSell} disabled={selling || !selectedItem}>
                  {selling ? "Processing..." : "Sell"}
                </button>
              </div>

              <div className="mt-3 small text-muted">This UI is frontend-only. Supply an <code>onSell(payload)</code> prop to integrate with your backend.</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h5 className="card-title">Recent Sales</h5>

              <div className="table-responsive">
                <table className="table table-borderless">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>GRN</th>
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-muted">No sales yet</td>
                      </tr>
                    ) : (
                      history.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ width: 180 }}>{new Date(s.timestamp).toLocaleString()}</td>
                          <td>{s.grn}</td>
                          <td>{s.title}</td>
                          <td className="text-center">{s.quantity}</td>
                          <td className="text-end">₹{Number(s.total).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <h6 className="mb-2">Current stock snapshot</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>GRN</th>
                        <th>Item</th>
                        <th className="text-center">In stock</th>
                        <th className="text-muted">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(it => (
                        <tr key={it.grn}>
                          <td>{it.grn}</td>
                          <td>{it.title}</td>
                          <td className={`text-center ${it.quantity <= 0 ? "text-danger" : ""}`}>{it.quantity}</td>
                          <td className="text-muted">₹{Number(it.price ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
