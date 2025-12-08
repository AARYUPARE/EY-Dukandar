import { useState } from "react";
import css from "../styles/AddStockForm.module.css";

export default function AddStockForm({ onAdd, onDone }) {
  const [form, setForm] = useState({
    grn: "",
    title: "",
    quantity: "",
    price: "",
    specifications: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
    setError("");
    setSuccess("");
  }

  function validate() {
    if (!String(form.grn).trim()) return "GRN is required";
    if (!String(form.title).trim()) return "Item name is required";
    if (!/^\d+$/.test(String(form.quantity).trim())) return "Quantity must be an integer";
    if (!/^\d+(\.\d{1,2})?$/.test(String(form.price).trim())) return "Price must be a number (up to 2 decimals)";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      grn: isNaN(Number(form.grn)) ? form.grn : Number(form.grn),
      title: form.title.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      specifications: form.specifications.trim()
    };

    try {
      const result = onAdd ? onAdd(payload) : null;
      if (result && typeof result.then === "function") await result;
      setSuccess("Item added");
      setForm({ grn: "", title: "", quantity: "", price: "", specifications: "" });
      if (typeof onDone === "function") onDone(payload);
    } catch (err) {
      setError(err?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <h3 className={css.title}>Add Stock</h3>

      <div className={css.row}>
        <label>GRN</label>
        <input value={form.grn} onChange={(e) => update("grn", e.target.value)} placeholder="e.g. 101" />
      </div>

      <div className={css.row}>
        <label>Item Name</label>
        <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Item name" />
      </div>

      <div className={css.rowGrid}>
        <div className={css.col}>
          <label>Quantity</label>
          <input value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="0" />
        </div>

        <div className={css.col}>
          <label>Price per item</label>
          <input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0.00" />
        </div>
      </div>

      <div className={css.row}>
        <label>Specifications</label>
        <textarea value={form.specifications} onChange={(e) => update("specifications", e.target.value)} placeholder="Comma separated or free text" />
      </div>

      {error && <div className={css.error}>{error}</div>}
      {success && <div className={css.success}>{success}</div>}

      <div className={css.actions}>
        <button type="button" className={css.ghost} onClick={() => { if (typeof onDone === "function") onDone(); }}>Cancel</button>
        <button type="submit" className={css.primary} disabled={loading}>{loading ? "Adding..." : "Add Stock"}</button>
      </div>
    </form>
  );
}
