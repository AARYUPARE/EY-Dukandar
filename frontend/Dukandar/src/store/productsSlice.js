import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: {
    canShow: true,
    products: [

    ],
  },
  reducers: {
    addProducts(state, action) {
      state.products = [...action.payload];
      console.log("State Products: ", state.products);
    },
    clearProducts() {
      return { products: [] }
    },

    setCanShow(state, action) {
      state.canShow = action.payload
    }
  },
});

export default productsSlice