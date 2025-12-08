import { useState, useMemo } from "react";
import "../styles/SendOrder.css";

export default function SendOrder() {
  const [form, setForm] = useState({
    company: "",
    contact: "",
    note: "",
    item: "",
    quantity: ""
  });

  const sampleInventory = [
    { grn: "GRN101", title: "Mouse", quantity: 0, specs: "Optical, USB" },
    { grn: "GRN205", title: "Keyboard", quantity: 1, specs: "Mechanical, Blue" },
    { grn: "GRN334", title: "Monitor", quantity: 0, specs: "24\", 1080p" },
    { grn: "GRN412", title: "SSD 256GB", quantity: 2, specs: "SATA" },
    { grn: "GRN599", title: "Headset", quantity: 0, specs: "Mic, 3.5mm" }
  ];

  const exhausted = useMemo(() => sampleInventory.filter(i => i.quantity <= 0 || i.quantity === 1), []);

  const [selected, setSelected] = useState({});
  const [sentOrders, setSentOrders] = useState([]);

  function updateField(k, v) {
    setForm(s => ({ ...s, [k]: v }));
  }

  function toggleSelect(grn) {
    setSelected(s => ({ ...s, [grn]: !s[grn] }));
  }

  function selectAll() {
    const all = {};
    exhausted.forEach(it => { all[it.grn] = true; });
    setSelected(all);
  }

  function clearSelection() {
    setSelected({});
  }

  function sendSelected() {
    const toSend = exhausted.filter(it => selected[it.grn]);
    if (toSend.length === 0) return;
    const payload = {
      company: form.company,
      contact: form.contact,
      note: form.note,
      items: toSend
    };
    setSentOrders(s => [payload, ...s]);
    clearSelection();
    setForm({ company: "", contact: "", note: "", item: "", quantity: "" });
  }

  return (
    <div className="container-fluid p-3 send-order-root">
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card panel">
            <div className="card-body">
              <h4 className="card-title">Send Order to Company</h4>

              <div className="mb-3">
                <label className="form-label">Company name</label>
                <input className="form-control" value={form.company} onChange={e => updateField("company", e.target.value)} placeholder="Company name" />
              </div>

              <div className="mb-3">
                <label className="form-label">Contact / Phone</label>
                <input className="form-control" value={form.contact} onChange={e => updateField("contact", e.target.value)} placeholder="Contact details" />
              </div>

              <div className="mb-3 row g-2">
                <div className="col">
                  <label className="form-label">Item (optional)</label>
                  <input className="form-control" value={form.item} onChange={e => updateField("item", e.target.value)} placeholder="Item name" />
                </div>
                <div className="col-4">
                  <label className="form-label">Quantity</label>
                  <input type="number" min="0" className="form-control" value={form.quantity} onChange={e => updateField("quantity", e.target.value)} placeholder="Qty" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Note</label>
                <textarea className="form-control" rows="3" value={form.note} onChange={e => updateField("note", e.target.value)} placeholder="Optional message to supplier" />
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-light" onClick={selectAll}>Select all exhausted</button>
                <button type="button" className="btn btn-outline-secondary" onClick={clearSelection}>Clear</button>
                <button type="button" className="btn btn-primary ms-auto" onClick={sendSelected}>Send Selected</button>
              </div>

              {sentOrders.length > 0 && (
                <div className="mt-3">
                  <div className="small text-muted">Recent orders (frontend only)</div>
                  <ul className="list-unstyled recent-orders">
                    {sentOrders.map((o, idx) => (
                      <li key={idx} className="order-item">
                        <strong>{o.company || "(no company)"}</strong> — {o.items.length} item(s)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card panel">
            <div className="card-body">
              <h4 className="card-title">Exhausted Items</h4>

              <div className="table-responsive">
                <table className="table table-borderless table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col"><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelection()} /></th>
                      <th scope="col">GRN</th>
                      <th scope="col">Item</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Specs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exhausted.map(it => (
                      <tr key={it.grn} className={selected[it.grn] ? "table-selected" : ""}>
                        <td><input type="checkbox" checked={!!selected[it.grn]} onChange={() => toggleSelect(it.grn)} /></td>
                        <td>{it.grn}</td>
                        <td>{it.title}</td>
                        <td className={it.quantity <= 0 ? "text-danger" : ""}>{it.quantity}</td>
                        <td className="text-muted">{it.specs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 small text-muted">Rows are frontend-only sample data. Integrate with inventory state when ready.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
