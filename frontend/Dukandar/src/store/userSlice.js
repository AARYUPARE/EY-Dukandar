import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState:
  {
    id: -1,
    name: "Amit Sharma",
    gender: "M",
    DOB: "1995-06-18",
    email: "amit.sharma@example.com",
    phone: "+91 98765 43210",
    loyaltyPoints: 1,
    imageUrl: "https://i.pravatar.cc/300?img=12",
    pass: "",
    wishlist: []
  },
  reducers:
  {
    setUser(state, action) {
      return action.payload;
    },
  }
});

export default userSlice;