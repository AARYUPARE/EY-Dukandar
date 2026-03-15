import { createSlice } from "@reduxjs/toolkit";


const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
  },
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload);
    },

    updateMessage(state, action) {
      const { id, text } = action.payload;

      // 🚀 if blank marker → delete message
      if (text === "__blank__") {
        state.messages = state.messages.filter(m => m.id !== id);
        return;
      }

      // ⭐ normal update
      const msg = state.messages.find(m => m.id === id);
      if (msg) {
        Object.assign(msg, action.payload);
      }
    },
  },
});

export default chatSlice