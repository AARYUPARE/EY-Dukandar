import { createSlice } from "@reduxjs/toolkit";

const toggleCardContainers = createSlice({
  name: "containertoggle",
  initialState: 1,
  reducers: {
    showProducts() {
      return 1;
    },
    showStores() {
      return 2;
    }
  }
})

export default toggleCardContainers