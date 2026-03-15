import { createSlice } from "@reduxjs/toolkit";

const overlaySlice = createSlice({
  name: 'overlay',
  initialState: "",
  reducers:
  {
    setOverlayText(state, action) {
      return action.payload;
    },
    clearOverlay() {
      return "";
    }
  }
})

export default overlaySlice