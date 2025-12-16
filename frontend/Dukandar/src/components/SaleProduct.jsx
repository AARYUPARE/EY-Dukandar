import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import css from "../styles/SaleProduct.module.css";
import {
  IoArrowBackCircle,
  IoAddCircleOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_BACKEND_URL } from "../store/store";

export default function SaleProduct() {
  const kioskStore = useSelector((store) => store.kioskStore);
  const navigate = useNavigate();

  // =========================
  // Product master list
  // =========================
  const [productList, setProductList] = useState([]);

  // =========================
  // Inventory list (for stock check)
  // =========================
  const [inventoryList, setInventoryList] = useState([]);

  // =========================
  // Fetch product list
  // =========================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_BACKEND_URL}/products`);
        setProductList(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to fetch products", e);
      }
    };

    fetchProducts();
  }, []);

  // =========================
  // Fetch inventory
  // =========================
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get(
          `${BASE_BACKEND_URL}/inventory/store/${kioskStore.id}`
        );
        setInventoryList(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to fetch inventory", e);
      }
    };

    if (kioskStore?.id) fetchInventory();
  }, [kioskStore]);

  const [rows, setRows] = useState([
    {
      sku: "",
      productId: null,
      title: "",
      price: "",
      quantity: "",
      total: "",
    },
  ]);

  // =========================
  // Empty inventory guard
  // =========================
  if (!inventoryList || inventoryList.length === 0) {
    return (
      <div className={css.wrapper}>
        <button className={css.backBtn} onClick={() => navigate("../")}>
          <IoArrowBackCircle size={32} />
        </button>

        <div className={css.panel}>
          <h2 className={css.title}>Inventory Exhausted</h2>
          <p className={css.emptyMsg}>
            No items available to sell. Please restock inventory first.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // Sale rows
  // =========================

  // =========================
  // Update row
  // =========================
  function updateRow(index, field, value) {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // SKU → product lookup
      if (field === "sku") {
        const product = productList.find(
          (p) => String(p.sku) === String(value)
        );

        if (product) {
          updated[index].title = product.name;
          updated[index].price = product.price;
          updated[index].productId = product.id;
        } else {
          updated[index].title = "";
          updated[index].price = "";
          updated[index].productId = null;
        }
      }

      // Quantity → stock validation
      if (field === "quantity") {
        const inventoryItem = inventoryList.find(
          (inv) => inv.productId === updated[index].productId
        );

        if (!inventoryItem) {
          alert("Item not available in inventory");
          updated[index].quantity = "";
          updated[index].total = "";
        } else if (Number(value) > inventoryItem.stockQuantity) {
          alert("Item quantity exceeded present stock!");
          updated[index].quantity = "";
          updated[index].total = "";
        } else {
          updated[index].total =
            Number(updated[index].price || 0) * Number(value || 0);
        }
      }

      return updated;
    });
  }

  // =========================
  // Row controls
  // =========================
  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        sku: "",
        productId: null,
        title: "",
        price: "",
        quantity: "",
        total: "",
      },
    ]);
  }

  function removeRow(index) {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  // =========================
  // Submit sale
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    const validRows = rows.filter(
      (r) => r.productId && Number(r.quantity) > 0
    );

    if (validRows.length === 0) {
      alert("No valid sale rows found");
      return;
    }

    try {
      for (const row of validRows) {
        const url = `${BASE_BACKEND_URL}/${kioskStore.id}/${row.productId}/reduce`;

        await axios.post(url, null, {
          params: {
            qty: row.quantity,
          },
        });
      }

      alert("Sale completed successfully ✅");

      setRows([
        {
          sku: "",
          productId: null,
          title: "",
          price: "",
          quantity: "",
          total: "",
        },
      ]);
    } catch (error) {
      console.error("Sale failed", error);
      alert("Sale failed ❌");
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className={css.wrapper}>
      <button className={css.backBtn} onClick={() => navigate("../")}>
        <IoArrowBackCircle size={32} />
      </button>

      <div className={css.panel}>
        <h2 className={css.title}>Sell Product (Excel Sheet)</h2>

        <form onSubmit={handleSubmit}>
          <div className={css.tableHeader}>
            <span>SKU</span>
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
                value={row.price}
                disabled
                placeholder="₹ Price"
              />

              <input
                className={css.input}
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) =>
                  updateRow(i, "quantity", Number(e.target.value))
                }
              />

              <input
                className={css.input}
                disabled
                value={row.total}
                placeholder="₹ Total"
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
              Sell Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
