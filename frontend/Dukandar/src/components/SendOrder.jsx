import { useState, useMemo, useEffect } from "react";
import "../styles/SendOrder.css";
import { IoArrowBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function SendOrder() {
  const navigate = useNavigate();

  const onBack = () => navigate("../");

  const [form, setForm] = useState({
    company: "",
    contact: "",
    note: "",
    item: "",
    quantity: "",
  });

  const inventoryList = [];

  useEffect(() => {}, []);

  const exhausted = useMemo(
    () => inventoryList.filter((i) => i.quantity <= 1),
    [inventoryList]
  );

  const [selected, setSelected] = useState({});
  const [sentOrders, setSentOrders] = useState([]);

  function updateField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function toggleSelect(grn) {
    setSelected((s) => ({ ...s, [grn]: !s[grn] }));
  }

  function selectAll() {
    const all = {};
    exhausted.forEach((it) => (all[it.grn] = true));
    setSelected(all);
  }

  function clearSelection() {
    setSelected({});
  }

  function sendSelected() {
    const toSend = exhausted.filter((it) => selected[it.grn]);
    if (!toSend.length) return;

    setSentOrders((s) => [
      { company: form.company, items: toSend },
      ...s,
    ]);

    clearSelection();
    setForm({
      company: "",
      contact: "",
      note: "",
      item: "",
      quantity: "",
    });
  }

  return (
    <div className="send-order-root">
      <button className="back-btn" onClick={onBack}>
        <IoArrowBackCircle size={26} />
      </button>

      <div className="send-order-frame">
        <div className="row g-4 h-100">

          {/* LEFT */}
          <div className="col-12 col-md-6">
            <div className="panel">
              <h4 className="title">Send Order to Company</h4>

              <div className="section">
                <label>Company name</label>
                <input
                  className="input"
                  value={form.company}
                  onChange={(e) =>
                    updateField("company", e.target.value)
                  }
                  placeholder="Company name"
                />
              </div>

              <div className="section">
                <label>Contact / Phone</label>
                <input
                  className="input"
                  value={form.contact}
                  onChange={(e) =>
                    updateField("contact", e.target.value)
                  }
                  placeholder="Contact details"
                />
              </div>

              <div className="section grid">
                <div>
                  <label>Item (optional)</label>
                  <input
                    className="input"
                    value={form.item}
                    onChange={(e) =>
                      updateField("item", e.target.value)
                    }
                    placeholder="Item name"
                  />
                </div>

                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="input"
                    value={form.quantity}
                    onChange={(e) =>
                      updateField("quantity", e.target.value)
                    }
                    placeholder="Qty"
                  />
                </div>
              </div>

              <div className="section">
                <label>Note</label>
                <textarea
                  className="input"
                  rows="3"
                  value={form.note}
                  onChange={(e) =>
                    updateField("note", e.target.value)
                  }
                  placeholder="Optional message"
                />
              </div>

              <div className="actions">
                <button className="btn" onClick={selectAll}>
                  Select all exhausted
                </button>
                <button className="btn" onClick={clearSelection}>
                  Clear
                </button>
                <button className="btn primary" onClick={sendSelected}>
                  Send Selected
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-12 col-md-6">
            <div className="panel">
              <h4 className="title">Exhausted Items</h4>

              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>GRN</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Specs</th>
                  </tr>
                </thead>

                <tbody>
                  {exhausted.map((it) => (
                    <tr key={it.grn}>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!selected[it.grn]}
                          onChange={() =>
                            toggleSelect(it.grn)
                          }
                        />
                      </td>
                      <td>{it.grn}</td>
                      <td>{it.title}</td>
                      <td>{it.quantity}</td>
                      <td>{it.specs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}