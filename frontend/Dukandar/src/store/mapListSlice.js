import { createSlice } from "@reduxjs/toolkit";


const mapList = createSlice({
  name: "mapList",
  initialState:
  {
    stores: [],
    showRoutes: false
  },
  reducers:
  {
    setStores(state, action) {
      state.stores = action.payload;
    },
    setShowRoutes(state, action) {
      state.showRoutes = action.payload;
    },
    clearMapList() {
      return {
        stores: [],
        showRoutes: false,
      }
    }
  }
})

export default mapList  