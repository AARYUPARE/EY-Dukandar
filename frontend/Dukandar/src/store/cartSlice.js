import { createSlice } from "@reduxjs/toolkit";


const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: []
  },
  reducers: {

    // 🔥 Add item (scan or manual add)
    addItem: (state, action) => {
      const item = action.payload;

      const existing = state.items.find(i => i.sku === item.sku);

      if (existing) {
        existing.qty += 1;   // same item → increment
      } else {
        state.items.push({ ...item, qty: 1 });
      }
    },


    // 🔥 Remove item completely
    removeItem: (state, action) => {
      const sku = action.payload;

      state.items = state.items.filter(i => i.sku !== sku);
    },


    // 🔥 Update quantity manually
    updateQty: (state, action) => {
      const { sku, qty } = action.payload;

      const item = state.items.find(i => i.sku === sku);

      if (!item) return;

      if (qty <= 0) {
        state.items = state.items.filter(i => i.sku !== sku);
      } else {
        item.qty = qty;
      }
    },


    // 🔥 Clear cart (after payment)
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export default cartSlice