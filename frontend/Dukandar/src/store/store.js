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
    const res = await axios.post("http://localhost:5000/chat", { prompt });
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    // 🔥 Fake response (always same, or echo)
    // const res = "This is a fake bot reply for: " + prompt;

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
        id: 1,
        name: "Formal Shirt",
        sku: "",
        price: 1000.0000,
        brand: "Cotton King",
        category: "Shirt",
        subCategory: [
          "Formal",
          "Men"
        ],
        description: "Best shirt for formal wear",
        imageUrl: "https://raw.githubusercontent.com/AARYUPARE/EY-Dukandar-Assets/main/images/formalShirt1.png",
        modelUrl: "https://raw.githubusercontent.com/AARYUPARE/EY-Dukandar-Assets/main/models/formalShirt1.glb",
      },
      {
        id: 2,
        name: "Business Suit",
        sku: "",
        price: 1000.0000,
        brand: "Ramesh Dieing",
        category: "Suit",
        subCategory: [
          "Whole Outfit",
          "Black"
        ],
        description: "This is full outfit created for business meetings",
        imageUrl: "https://raw.githubusercontent.com/AARYUPARE/EY-Dukandar-Assets/main/images/businessSuit1.png",
        modelUrl: "https://raw.githubusercontent.com/AARYUPARE/EY-Dukandar-Assets/main/models/businessSuit1.glb",
      },
      {
        id: 3,
        name: "Sports Shoes",
        sku: "",
        price: 1000.0000,
        brand: "Nike",
        category: "Shoes",
        subCategory: [
          "Sprots",
          "Nike"
        ],
        description: "Best product for running shoes",
        imageUrl: "https://raw.githubusercontent.com/AARYUPARE/EY-Dukandar-Assets/main/images/nikeShoes1.png",
        modelUrl: "https://raw.githubusercontent.com/AARYUPARE/EY-Dukandar-Assets/main/models/nikeShoes1.glb",
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
          id: 1,
          name: "Buy 1 Get 1 Free - Men's Shirts",
          sku: "",
          price: 1000.0000,
          brand: "Brand name 3",
          category: "Main Category 3",
          subCategory: [
            "Sub Category 1",
            "Sub Category 2"
          ],
          description: "Buy 1 shirt and get another free.",
          imageUrl: "https://tse1.mm.bing.net/th/id/OIP.O87oS-9nFstg741tkap5GwHaEK?cb=ucfimg2&ucfimg=1&w=1920&h=1080&rs=1&pid=ImgDetMain&o=7&rm=3",
          modelUrl: "",
        },
        {
          id: 2,
          name: "Flat ₹500 off on Shoes",
          sku: "",
          price: 1000.0000,
          brand: "Brand name 3",
          category: "Main Category 3",
          subCategory: [
            "Sub Category 1",
            "Sub Category 2"
          ],
          description: "Valid only for offline customers. Best Price, Exclusive",
          imageUrl: "https://tse1.mm.bing.net/th/id/OIP.O87oS-9nFstg741tkap5GwHaEK?cb=ucfimg2&ucfimg=1&w=1920&h=1080&rs=1&pid=ImgDetMain&o=7&rm=3",
          modelUrl: "",
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
