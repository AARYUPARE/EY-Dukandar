import { useState, useMemo, useEffect } from "react";
import "../styles/SendOrder.css";
import { IoArrowBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function SendOrder({  }) {
const navigate = useNavigate()

  const onBack = () => 
  {
    navigate("../")
  }
  
  const [form, setForm] = useState({
    company: "",
    contact: "",
    note: "",
    item: "",
    quantity: ""
  });

  const inventoryList = [ ];

  useEffect(() => {
    //fetch inventory, and put it into inventory list
  })

  const exhausted = useMemo(() => inventoryList.filter(i => i.quantity <= 1), []);

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

    //Send order to company

    setSentOrders(s => [payload, ...s]);
    clearSelection();
    setForm({ company: "", contact: "", note: "", item: "", quantity: "" });
  }

  return (
    <div className="container-fluid p-12 send-order-root">

      {/* 🔙 Back Button */}
      <button className="back-btn" onClick={onBack}>
        <IoArrowBackCircle size={42} />
      </button>

      <div className="row g-3">

        {/* LEFT PANEL — Send Order Form */}
        <div className="col-12 col-md-6">
          <div className="card panel">
            <div className="card-body">
              <h4 className="card-title neon-title">Send Order to Company</h4>

              {/* form fields */}
              <div className="mb-3">
                <label className="form-label">Company name</label>
                <input className="form-control neon-input" value={form.company} onChange={e => updateField("company", e.target.value)} placeholder="Company name" />
              </div>

              <div className="mb-3">
                <label className="form-label">Contact / Phone</label>
                <input className="form-control neon-input" value={form.contact} onChange={e => updateField("contact", e.target.value)} placeholder="Contact details" />
              </div>

              <div className="mb-3 row g-2">
                <div className="col">
                  <label className="form-label">Item (optional)</label>
                  <input className="form-control neon-input" value={form.item} onChange={e => updateField("item", e.target.value)} placeholder="Item name" />
                </div>
                <div className="col-4">
                  <label className="form-label">Quantity</label>
                  <input type="number" min="0" className="form-control neon-input" value={form.quantity} onChange={e => updateField("quantity", e.target.value)} placeholder="Qty" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Note</label>
                <textarea className="form-control neon-input" rows="3" value={form.note} onChange={e => updateField("note", e.target.value)} placeholder="Optional message" />
              </div>

              {/* buttons */}
              <div className="d-flex gap-2">
                <button type="button" className="btn ghost-btn" onClick={selectAll}>Select all exhausted</button>
                <button type="button" className="btn ghost-grey" onClick={clearSelection}>Clear</button>
                <button type="button" className="btn neon-btn ms-auto" onClick={sendSelected}>Send Selected</button>
              </div>

              {/* recent orders */}
              {sentOrders.length > 0 && (
                <div className="mt-3">
                  <div className="small text-muted">Recent orders</div>
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

        {/* RIGHT PANEL — Exhausted Table */}
        <div className="col-12 col-md-6">
          <div className="card panel">
            <div className="card-body">
              <h4 className="card-title neon-title">Exhausted Items</h4>

              <div className="table-responsive">
                <table className="table table-borderless table-hover align-middle neon-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelection()} /></th>
                      <th>GRN</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Specs</th>
                    </tr>
                  </thead>

                  <tbody>
                    {exhausted.map(it => (
                      <tr key={it.grn} className={selected[it.grn] ? "table-selected" : ""}>
                        <td><input type="checkbox" checked={!!selected[it.grn]} onChange={() => toggleSelect(it.grn)} /></td>
                        <td>{it.grn}</td>
                        <td>{it.title}</td>
                        <td className={it.quantity <= 0 ? "text-danger" : ""}>{it.quantity}</td>
                        <td >{it.specs}</td>
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
  );
}
