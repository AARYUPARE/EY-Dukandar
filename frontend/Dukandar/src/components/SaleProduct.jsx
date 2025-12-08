import { useState } from "react";
import { useSelector } from "react-redux";
import css from "../styles/SaleProduct.module.css";
import { IoArrowBackCircle, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function SaleProduct() {

  const onSubmit = () => {}

  const navigate = useNavigate();
  const productList = useSelector((store) => store.products.products);

  const [rows, setRows] = useState([
    { grn: "", title: "", price: "", quantity: "", total: "" }
  ]);

  function updateRow(index, field, value) {
    const updated = [...rows];
    updated[index][field] = value;

    // Autofill name & price when GRN matches
    if (field === "grn") {
      const found = productList.find((p) => String(p.grn) === String(value));
      updated[index].title = found ? found.title : "";
      updated[index].price = found ? found.extraDetails.finalPrice : "";
    }

    // Auto calculate total
    if (field === "quantity") {
      const price = Number(updated[index].price || 0);
      updated[index].total = price * Number(value || 0);
    }

    setRows(updated);
  }

  function addRow() {
    setRows([...rows, { grn: "", title: "", price: "", quantity: "", total: "" }]);
  }

  function removeRow(index) {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) onSubmit(rows);
  }

  return (
    <div className={css.wrapper}>

      {/* BACK BUTTON */}
      <button className={css.backBtn} onClick={() => navigate("../")}>
        <IoArrowBackCircle size={32} />
      </button>

      <div className={css.panel}>
        <h2 className={css.title}>Sell Product (Excel Sheet)</h2>

        <form onSubmit={handleSubmit}>

          <div className={css.tableHeader}>
            <span>GRN</span>
            <span>Item Name</span>
            <span>Price</span>
            <span>Qty</span>
            <span>Total</span>
            <span>Action</span>
          </div>

          {rows.map((row, i) => (
            <div key={i} className={css.tableRow}>

              <input
                className={css.input}
                placeholder="Enter GRN"
                value={row.grn}
                onChange={(e) => updateRow(i, "grn", e.target.value)}
              />

              <input
                className={css.input}
                value={row.title}
                disabled
                placeholder="Auto-filled"
              />

              <input
                className={css.input}
                value={row.price}
                disabled
                placeholder="₹ Price"
              />

              <input
                className={css.input}
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(i, "quantity", e.target.value)}
              />

              <input
                className={css.input}
                disabled
                value={row.total}
                placeholder="₹ Total"
              />

              <button type="button" className={css.deleteBtn} onClick={() => removeRow(i)}>
                <IoTrashOutline size={22} />
              </button>

            </div>
          ))}

          <div className={css.actions}>
            <button type="button" className={css.addRowBtn} onClick={addRow}>
              <IoAddCircleOutline size={26} /> Add Row
            </button>

            <button type="submit" className={css.submitBtn}>
              Sell Now
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
