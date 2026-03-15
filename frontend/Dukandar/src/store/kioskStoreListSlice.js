import { createSlice } from "@reduxjs/toolkit";


const kioskStoreListSlice = createSlice({
  name: "kioskStoreList",
  initialState: {
    stores: [
      // {
      //   "id": 1,
      //   "name": "ABFRL Phoenix Mall Store",
      //   "address": "Phoenix Marketcity Mall, Kurla West, Mumbai",
      //   "phone": "+91 9876543210",
      //   "latitude": 19.0865,
      //   "longitude": 72.8897,
      //   "imageUrl": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da"
      // },
      // {
      //   "id": 2,
      //   "name": "ABFRL R City Mall Store",
      //   "address": "R City Mall, Ghatkopar West, Mumbai",
      //   "phone": "+91 9822223344",
      //   "latitude": 19.0994,
      //   "longitude": 72.9167,
      //   "imageUrl": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a"
      // },
      // {
      //   "id": 3,
      //   "name": "ABFRL Viviana Mall Store",
      //   "address": "Viviana Mall, Thane West, Maharashtra",
      //   "phone": "+91 9811112233",
      //   "latitude": 19.2147,
      //   "longitude": 72.9712,
      //   "imageUrl": "https://images.unsplash.com/photo-1560393464-5c69a73c5770"
      // }
    ],
  },
  reducers: {
    addKioskStores(state, action) {
      const existingIds = new Set(state.stores.map(s => String(s.id)));

      const filtered = action.payload.stores.filter(
        store => !existingIds.has(String(store.id))
      );

      // add new stores at TOP
      state.stores.unshift(...filtered);
    },

    clearKioskStores() {
      return { stores: [] }
    }
  },
});

export default kioskStoreListSlice