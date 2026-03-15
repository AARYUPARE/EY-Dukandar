import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    id: "",
  },
  reducers: {
    setSessionId(state, action) {
      state.id = action.payload;
    }
  }
});

export default sessionSlice