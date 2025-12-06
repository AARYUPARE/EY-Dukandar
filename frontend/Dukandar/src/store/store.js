import { createSlice, createAsyncThunk, configureStore } from "@reduxjs/toolkit";
import axios from "axios";

export const sendMessageAsync = createAsyncThunk(
    "chat/sendMessage",
    async ({ prompt }, { dispatch, getState }) => {

        console.log("Async Call")
        const loaderId = Date.now() + "-loader";

        // Add user message
        dispatch(chatAction.addMessage({
            id: Date.now(),
            sender: "user",
            text: prompt
        }));

        // Add loader message
        dispatch(chatAction.addMessage({
            id: loaderId,
            sender: "bot",
            text: "typing...",
            isLoading: true
        }));

        // Backend call
        // const res = await axios.post("http://localhost:5000/chat", { prompt });
        console.log("Waiting")
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 🔥 Fake response (always same, or echo)
        const res = "This is a fake bot reply for: " + prompt;

        // Update loader to real message
        dispatch(chatAction.updateMessage({
            id: loaderId,
            text: res,
            isLoading: false
        }));
    }
);

const chatSlice = createSlice(
    {
        name: "chat",
        initialState: {
            messages: []
        },
        reducers:
        {
            addMessage(state, action) {
                state.messages.push(action.payload);
            },

            updateMessage(state, action) {
                const msg = state.messages.find(m => m.id === action.payload.id);

                if (msg) {
                    msg.text = action.payload.text;
                    msg.isLoading = false;
                }
            }
        }
    }
)

export const chatAction = chatSlice.actions;

const store = configureStore({
    reducer:
    {
        chat: chatSlice.reducer
    }
})

export default store