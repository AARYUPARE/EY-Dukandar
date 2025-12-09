import { useEffect, useState } from "react";
import css from "../styles/AddStockForm.module.css";
import { IoArrowBackCircle, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function AddStockSheet() {

  const navigate = useNavigate();
  const productList = useState([])

  const [rows, setRows] = useState([
    { grn: "", title: "", quantity: "" }
  ]);

  function updateRow(index, field, value) {
    const newRows = [...rows];
    newRows[index][field] = value;

    if (field === "grn") {
      const found = productList.find((p) => String(p.grn) === String(value));
      newRows[index].title = found ? found.title : "";
    }

    setRows(newRows);
  }

  useEffect(() => {

    //fetch company-product list
    //fetch the store order list and set to rows so it will show the ordered stock directly

  },[])


  function addRow() {
    setRows([...rows, { grn: "", title: "", quantity: "" }]);
  }

  function removeRow(index) {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // if (onSubmit) onSubmit(rows);

    //we will get rows in this, just add those in the stores inventory
  }

  const onBack = () =>
  {
    navigate("../")
  }

  return (
    <div className={css.wrapper}>

      {/* --- Back Button --- */}
      <button className={css.backBtn} onClick={onBack}>
        <IoArrowBackCircle size={32} />
      </button>

      <div className={css.panel}>
        <h2 className={css.title}>Add Stock (Excel Style)</h2>

        <form onSubmit={handleSubmit}>

          <div className={css.tableHeader}>
            <span>GRN</span>
            <span>Item Name</span>
            <span>Quantity</span>
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
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(i, "quantity", e.target.value)}
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
              Submit Stock
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
