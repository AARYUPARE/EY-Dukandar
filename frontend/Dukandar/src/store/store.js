import {
  createSlice,
  createAsyncThunk,
  configureStore,
} from "@reduxjs/toolkit";
import axios from "axios";

export const sendMessageAsync = createAsyncThunk(
  "chat/sendMessage",
  async ({ prompt }, { dispatch, getState }) => {
    const loaderId = Date.now() + "-loader";

    // Add user message
    dispatch(
      chatAction.addMessage({
        id: Date.now(),
        sender: "user",
        text: prompt,
      })
    );

    // Add loader message
    dispatch(
      chatAction.addMessage({
        id: loaderId,
        sender: "bot",
        text: "typing...",
        isLoading: true,
      })
    );

    // Backend call
    // const res = await axios.post("http://localhost:5000/chat", { prompt });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 🔥 Fake response (always same, or echo)
    const res = "This is a fake bot reply for: " + prompt;

    // Update loader to real message
    dispatch(
      chatAction.updateMessage({
        id: loaderId,
        text: res,
        isLoading: false,
      })
    );
  }
);

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
      const msg = state.messages.find((m) => m.id === action.payload.id);

      if (msg) {
        msg.text = action.payload.text;
        msg.isLoading = false;
      }
    },
  },
});

const toggleSideSlice = createSlice({
  name: "toggleSide",
  initialState: {
    sideBar: "full",
  },
  reducers: {
    expand(state, action) {
      state.sideBar = "full";
    },

    collapse(state, action) {
      state.sideBar = "collapse";
    },
  },
});

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [
      {
        grn: 1,
        title: "Virat Kohli",
        image: "https://static.sociofyme.com/photo/151616345/151616345.jpg",
        modelUrl: "/models/Shirt2.glb",
        details: {
          summary: "Recommended item 1",
          strengths: ["Best Quality", "King"],
          description: "",
        },
        extraDetails: {
          originalPrice: 1000,
          offers: "",
          finalPrcice: 500,
        },
      },
      {
        grn: 2,
        title: "Laptop",
        image: "https://picsum.photos/300",
        modelUrl: "",
        details: {
          summary: "Recommended item 2",
          strengths: [],
          description: "",
        },
        extraDetails: {
          originalPrice: 1000,
          offers: "",
          finalPrcice: 500,
        },
      },
      {
        grn: 3,
        title: "Shoes",
        image: "https://picsum.photos/310",
        modelUrl: "",
        details: {
          summary: "Recommended item 3",
          strengths: [],
          description: "",
        },
        extraDetails: {
          originalPrice: 1000,
          offers: "",
          finalPrcice: 500,
        },
      },
    ],
  },
  reducers: {
    addProducts(state, action) {
      state.products = [...state.products, ...action.payload.products];
    },
  },
});

const showcaseSlice = createSlice(
  {
    name: "Showcase Product",

    initialState:
    {
      
    },
    reducers:
    {
      setShowcase(state, action) {
        return action.payload;
      }
    }

  }
)

export const chatAction = chatSlice.actions;
export const sideBarAction = toggleSideSlice.actions;
export const productsAction = productsSlice.actions;
export const showcaseAction = showcaseSlice.actions;

const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
    sideBar: toggleSideSlice.reducer,
    products: productsSlice.reducer,
    showcase: showcaseSlice.reducer,
  },
});

export default store;
