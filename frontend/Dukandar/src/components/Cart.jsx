import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  cartActions
} from "../store/store";

import PaymentOverlay from "./PaymentOverlay";

import css from "../styles/Cart.module.css";
import { IoTrashOutline } from "react-icons/io5";

export default function Cart() {
  const dispatch = useDispatch();

  // 🔥 get items from redux instead of local state
  const rows = useSelector((state) => state.cart.items);

  // 🔥 calculate total
  const grandTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.price * r.qty, 0),
    [rows]
  );

  function handleQtyChange(sku, value) {
    dispatch(cartActions.updateQty({ sku, qty: Number(value) }));
  }

  function handleDelete(sku) {
    dispatch(cartActions.removeItem(sku));
  }

  function handleCheckout() {
    // later → call backend purchase API
    console.log("Checkout:", rows);

    dispatch(cartActions.clearCart());
  }

  return (
    <>
    <PaymentOverlay />
    <div className={css.wrapper}>
      <div className={css.panel}>
        <h2 className={css.title}>Your Cart</h2>

        <div className={css.tableHeader}>
          <span>SKU</span>
          <span>Item</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Total</span>
          <span>Action</span>
        </div>

        {rows.map((row) => (
          <div key={row.sku} className={css.tableRow}>
            <input className={css.input} value={row.sku} disabled />
            <input className={css.input} value={row.title} disabled />
            <input className={css.input} value={`₹${row.price}`} disabled />

            <input
              className={css.input}
              type="number"
              min="1"
              value={row.qty}
              onChange={(e) =>
                handleQtyChange(row.sku, e.target.value)
              }
            />

            <input
              className={css.input}
              value={`₹${row.price * row.qty}`}
              disabled
            />

            <button
              className={css.deleteBtn}
              onClick={() => handleDelete(row.sku)}
            >
              <IoTrashOutline size={22} />
            </button>
          </div>
        ))}

        <div className={css.footer}>
          <span className={css.totalLabel}>Grand Total</span>
          <span className={css.totalAmount}>
            ₹{grandTotal.toLocaleString()}
          </span>
        </div>

        <button
          className={css.checkoutBtn}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
    </>
  );
}
