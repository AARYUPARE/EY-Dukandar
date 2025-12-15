import { useState, useMemo } from "react";
import css from "../styles/Cart.module.css";
import { IoTrashOutline } from "react-icons/io5";

const sampleCart = [
  { grn: "101", title: "Virat Kohli Shirt", price: 499, qty: 2 },
  { grn: "205", title: "Gaming Laptop", price: 45000, qty: 1 },
  { grn: "334", title: "Running Shoes", price: 2499, qty: 1 },
];

export default function Cart() {
  const [rows, setRows] = useState(sampleCart);

  const grandTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.price * r.qty, 0),
    [rows]
  );

  function updateQty(index, value) {
    const updated = [...rows];
    updated[index].qty = Math.max(1, Number(value || 1));
    setRows(updated);
  }

  function removeRow(index) {
    setRows(rows.filter((_, i) => i !== index));
  }

  return (
    <div className={css.wrapper}>
      <div className={css.panel}>
        <h2 className={css.title}>Your Cart</h2>

        <div className={css.tableHeader}>
          <span>GRN</span>
          <span>Item</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Total</span>
          <span>Action</span>
        </div>

        {rows.map((row, i) => (
          <div key={i} className={css.tableRow}>
            <input className={css.input} value={row.grn} disabled />
            <input className={css.input} value={row.title} disabled />
            <input className={css.input} value={`₹${row.price}`} disabled />

            <input
              className={css.input}
              type="number"
              min="1"
              value={row.qty}
              onChange={(e) => updateQty(i, e.target.value)}
            />

            <input
              className={css.input}
              value={`₹${row.price * row.qty}`}
              disabled
            />

            <button
              type="button"
              className={css.deleteBtn}
              onClick={() => removeRow(i)}
            >
              <IoTrashOutline size={22} />
            </button>
          </div>
        ))}

        <div className={css.footer}>
          <span className={css.totalLabel}>Grand Total</span>
          <span className={css.totalAmount}>₹{grandTotal.toLocaleString()}</span>
        </div>

        <button className={css.checkoutBtn}>Proceed to Checkout</button>
      </div>
    </div>
  );
}
