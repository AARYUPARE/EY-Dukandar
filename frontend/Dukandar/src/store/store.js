import {
  createSlice,
  createAsyncThunk,
  configureStore,
} from "@reduxjs/toolkit";
import axios from "axios";

const CHAT_API_URL = "http://localhost:8080/api/chat";

const userSlice = createSlice({
  name: "user",
  initialState: {
    id: 1,
  },
  reducers: {
    setUser(state, action) {
      state.id = action.payload.id;
    }
  }
}
)

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    id: null,
  },
  reducers: {
    setSessionId(state, action) {
      state.id = action.payload;
    }
  }
});

export const sendMessageAsync = createAsyncThunk(
  "chat/sendMessage",
  async ({ prompt }, { dispatch, getState }) => {
    console.log("sendMessageAsync called with prompt:", prompt);
    const loaderId = Date.now() + "-loader";

    let sessionState = getState().session || {};
    let sessionId = sessionState.id;

    console.log("1");
    if (!sessionId) {
      // generate and save new sessionId if none exists yet
      sessionId = Date.now().toString();
      dispatch(sessionActions.setSessionId(sessionId));
    }

    // add user message
    dispatch(
      chatAction.addMessage({
        id: Date.now(),
        sender: "user",
        text: prompt,
      })
    );

    // add loader
    dispatch(
      chatAction.addMessage({
        id: loaderId,
        sender: "bot",
        text: "typing...",
        isLoading: true,
      })
    );

    let res = null;  // Use let instead of const

    try {
      res = await axios.post(CHAT_API_URL, {
        userId: getState().user.id,
        sessionId: sessionId,
        message: prompt,
      });
      console.log("Response from backend:", res.data);

      // Update loader message to real response text
      dispatch(
        chatAction.updateMessage({
          id: loaderId,
          text: res.data,
          isLoading: false,
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);

      // Update loader message to show error message
      dispatch(
        chatAction.updateMessage({
          id: loaderId,
          text: "Failed to send message. Please try again.",
          isLoading: false,
        })
      );
    }
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
export const sessionActions = sessionSlice.actions;

const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
    sideBar: toggleSideSlice.reducer,
    products: productsSlice.reducer,
    showcase: showcaseSlice.reducer,
    offers: storeOffersSlice.reducer,
    session: sessionSlice.reducer,
    user: userSlice.reducer,
  },
});


export default store;
