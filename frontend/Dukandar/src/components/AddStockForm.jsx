import { useEffect, useState } from "react";
import css from "../styles/AddStockForm.module.css";
import {
  IoArrowBackCircle,
  IoAddCircleOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_BACKEND_URL } from "../store/store";
import { useSelector } from "react-redux";

export default function AddStockSheet() {
  const navigate = useNavigate();
  const kioskStore = useSelector((store) => store.kioskStore);

  const [productList, setProductList] = useState([]);

  const [rows, setRows] = useState([
    { sku: "", productId: null, title: "", size: "", quantity: "" },
  ]);

  // =========================
  // Update Row
  // =========================
  function updateRow(index, field, value) {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[index] = { ...newRows[index], [field]: value };

      // Auto-fill product name & productId from SKU
      if (field === "sku") {
        const found = productList.find(
          (p) => String(p.sku) === String(value)
        );

        newRows[index].title = found ? found.name : "";
        newRows[index].productId = found ? found.id : null;
      }

      return newRows;
    });
  }

  // =========================
  // Fetch Products
  // =========================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(BASE_BACKEND_URL + "/products");
        setProductList(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to fetch products", e);
      }
    };

    fetchProducts();
  }, []);

  // =========================
  // Row Controls
  // =========================
  function addRow() {
    setRows((prev) => [
      ...prev,
      { sku: "", productId: null, title: "", size: "", quantity: "" },
    ]);
  }

  function removeRow(index) {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  // =========================
  // Submit Stock
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    const validRows = rows.filter(
      (r) =>
        r.sku &&
        r.productId &&
        r.size &&
        Number(r.quantity) > 0
    );

    if (validRows.length === 0) {
      alert("Please add at least one valid stock row");
      return;
    }

    try {
      for (const row of validRows) {
        const url = `${BASE_BACKEND_URL}/${kioskStore.id}/${row.productId}`;

        await axios.post(url, null, {
          params: {
            newStock: row.quantity,
            size: row.size,
          },
        });
      }

      alert("Stock added successfully ✅");

      // Reset form
      setRows([
        { sku: "", productId: null, title: "", size: "", quantity: "" },
      ]);
    } catch (error) {
      console.error("Failed to add stock", error);
      alert("Failed to add stock ❌");
    }
  }

  const onBack = () => {
    navigate("../");
  };

  // =========================
  // UI
  // =========================
  return (
    <div className={css.wrapper}>
      <button className={css.backBtn} onClick={onBack}>
        <IoArrowBackCircle size={32} />
      </button>

      <div className={css.panel}>
        <h2 className={css.title}>Add Stock (Excel Style)</h2>

        <form onSubmit={handleSubmit}>
          <div className={css.tableHeader}>
            <span>SKU</span>
            <span>Item Name</span>
            <span>Size</span>
            <span>Quantity</span>
            <span>Action</span>
          </div>

          {rows.map((row, i) => (
            <div key={i} className={css.tableRow}>
              <input
                className={css.input}
                placeholder="Enter SKU"
                value={row.sku}
                onChange={(e) =>
                  updateRow(i, "sku", e.target.value)
                }
              />

              <input
                className={css.input}
                value={row.title}
                disabled
                placeholder="Auto-filled"
              />

              <input
                className={css.input}
                placeholder="Size (M / L / XL)"
                value={row.size}
                onChange={(e) =>
                  updateRow(i, "size", e.target.value)
                }
              />

              <input
                className={css.input}
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) =>
                  updateRow(i, "quantity", Number(e.target.value))
                }
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

          <div className={css.actions}>
            <button
              type="button"
              className={css.addRowBtn}
              onClick={addRow}
            >
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
