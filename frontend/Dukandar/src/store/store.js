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
          description: "A paragraph is a group of sentences that collectively express a single idea or theme. It serves as a building block in writing, helping to organize thoughts and make the text easier to read and understand. Each paragraph should focus on one main idea, supported by additional details or examples that enhance the reader's comprehension.A paragraph is a group of sentences that collectively express a single idea or theme. It serves as a building block in writing, helping to organize thoughts and make the text easier to read and understand. Each paragraph should focus on one main idea, supported by additional details or examples that enhance the reader's comprehension.A paragraph is a group of sentences that collectively express a single idea or theme. It serves as a building block in writing, helping to organize thoughts and make the text easier to read and understand. Each paragraph should focus on one main idea, supported by additional details or examples that enhance the reader's comprehension.A paragraph is a group of sentences that collectively express a single idea or theme. It serves as a building block in writing, helping to organize thoughts and make the text easier to read and understand. Each paragraph should focus on one main idea, supported by additional details or examples that enhance the reader's comprehension.",
        },
        extraDetails: {
          originalPrice: 1000,
          offers: "50% off",
          finalPrice: 500,
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
          finalPrice: 500,
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
          finalPrice: 500,
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

const storeOffersSlice = createSlice(
  {
    name: "storeOffers",
    initialState: {
        list: [
            {
                grn: 1,
                title: "Buy 1 Get 1 Free - Men's Shirts",
                image: "https://www.pixelstalk.net/wp-content/uploads/2016/07/Wallpapers-pexels-photo.jpg",
                modelUrl: "",
                details: {
                    summary: "BOGO Offer",
                    strengths: ["Limited Stock", "In-store Only"],
                    description: "Buy 1 shirt and get another free.",
                }
            },
            {
                grn: 2,
                title: "Flat ₹500 off on Shoes",
                image: "https://tse1.mm.bing.net/th/id/OIP.O87oS-9nFstg741tkap5GwHaEK?cb=ucfimg2&ucfimg=1&w=1920&h=1080&rs=1&pid=ImgDetMain&o=7&rm=3",
                modelUrl: "",
                details: {
                    summary: "Festival Discount",
                    strengths: ["Best Price", "Exclusive"],
                    description: "Valid only for offline customers.",
                }
            },
        ],
    },
    reducers: {}
  }
)

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
      },

      clearShowcase(state, action) {
        return {}
      }
    }

  }
)

export const chatAction = chatSlice.actions;
export const sideBarAction = toggleSideSlice.actions;
export const productsAction = productsSlice.actions;
export const showcaseAction = showcaseSlice.actions;
export const storeOffersAction = storeOffersSlice.actions;

const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
    sideBar: toggleSideSlice.reducer,
    products: productsSlice.reducer,
    showcase: showcaseSlice.reducer,
    offers: storeOffersSlice.reducer,
  },
});

export default store;
