import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import css from "../styles/SaleProduct.module.css";
import { IoArrowBackCircle, IoAddCircleOutline, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function SaleProduct() {


  const navigate = useNavigate();

  const inventoryList = [
    {
      grn: "101",
      title: "Virat Kohli Shirt",
      stock: 12,
      extraDetails: {
        finalPrice: 499,
        originalPrice: 799,
        offers: "35% OFF",
      }
    },
    {
      grn: "205",
      title: "Gaming Laptop",
      stock: 5,
      extraDetails: {
        finalPrice: 45000,
        originalPrice: 52000,
        offers: "13% OFF",
      }
    },
    {
      grn: "334",
      title: "Running Shoes",
      stock: 8,
      extraDetails: {
        finalPrice: 2499,
        originalPrice: 2899,
        offers: "14% OFF",
      }
    },
    {
      grn: "412",
      title: "SSD 256GB",
      stock: 2,
      extraDetails: {
        finalPrice: 1999,
        originalPrice: 2499,
        offers: "20% OFF",
      }
    },
    {
      grn: "599",
      title: "Wireless Headset",
      stock: 0,
      extraDetails: {
        finalPrice: 1599,
        originalPrice: 1999,
        offers: "20% OFF",
      }
    }
  ];

  useEffect(() => {
    //fetch inventory of the store and put it into the inventory list
  }, [])

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


  const [rows, setRows] = useState([
    { grn: "", title: "", price: "", quantity: "", total: "" }
  ]);

  function updateRow(index, field, value) {
    const updated = [...rows];
    updated[index][field] = value; // ALWAYS update input

    const found = inventoryList.find((p) => String(p.grn) === String(updated[index].grn));

    // GRN → Autofill Name & Price
    if (field === "grn") {
      if (found) {
        updated[index].title = found.title;
        updated[index].price = found.extraDetails.finalPrice;
      } else {
        // allow typing even when invalid
        updated[index].title = "";
        updated[index].price = "";
      }
    }

    // Quantity → Validate and calculate
    if (field === "quantity") {
      if (!found) {
        alert("Invalid GRN! Enter a valid item first.");
        updated[index].quantity = "";
        updated[index].total = "";
      } else if (Number(value) > found.stock) {
        alert("Item quantity exceeded present stock!");
        updated[index].quantity = "";
        updated[index].total = "";
      } else {
        const price = Number(updated[index].price || 0);
        updated[index].total = price * Number(value || 0);
      }
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

    //we will get rows, update those in the Data base.
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
