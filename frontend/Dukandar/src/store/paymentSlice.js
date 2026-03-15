import { createSlice } from "@reduxjs/toolkit";
import { makePayment } from "./makePaymentMethod";

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    wantPay: false,
    loading: false,
    status: null,
    error: null,
  },
  reducers: {
    resetPayment: (state) => {
      state.status = null;
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    startPayment(state) {
      state.status = null;
      state.error = null;
      state.wantPay = true;
    },
    closePayment(state) {
      state.wantPay = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(makePayment.pending, (state) => {
        state.loading = true;
        state.status = null;
      })
      .addCase(makePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.paymentStatus;
      })
      .addCase(makePayment.rejected, (state) => {
        state.loading = false;
        state.status = "failed";
        state.error = "Something went wrong";
      });
  },
});

export default paymentSlice