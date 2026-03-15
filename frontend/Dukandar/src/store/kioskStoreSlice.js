import { createSlice } from "@reduxjs/toolkit";


const kioskStoreSlice = createSlice({
  name: "store",
  initialState:
  {
    id: 13,
    name: "ABFRL Phoenix Mall Store",
    address: "Phoenix Marketcity, Viman Nagar, Pune",
    phone: "9876543210",
    latitude: 100.00,
    longitude: 100.00,
    imageUrl: "https://www.rli.uk.com/wp-content/uploads/2023/01/990283593_20230117093831_8328433219.jpeg",
  },

  reducers:
  {
    setStore(state, action) {
      return action.payload;
    },
  },
});

export default kioskStoreSlice;