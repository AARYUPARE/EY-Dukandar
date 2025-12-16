import {
  createSlice,
  createAsyncThunk,
  configureStore,
} from "@reduxjs/toolkit";
import axios from "axios";

export const BASE_BACKEND_URL = "http://localhost:8080/api"
const CHAT_API_URL = BASE_BACKEND_URL + "/chat";

const userSlice = createSlice({
  name: "user",
  initialState:
  {
    id: 1,
    name: "Amit Sharma",
    gender: "M",
    DOB: "1995-06-18",
    email: "amit.sharma@example.com",
    phone: "+91 98765 43210",
    loyaltyPoints: 1,
    imageUrl: "https://i.pravatar.cc/300?img=12",
    pass: "",
  },
  reducers:
  {
    setUser(state, action) {
      return action.payload;
    },
  }
});

const kioskStoreSlice = createSlice({
  name: "store",
  initialState:
  {
    id: 1,
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
    const time = Date.now().toString();
    const loaderId = time + "-loader";

    let sessionState = getState().session || {};
    let sessionId = sessionState.id;

    if (!sessionId) {
      sessionId = Date.now().toString();
      dispatch(sessionActions.setSessionId(sessionId));
    }

    // add user message
    dispatch(
      chatAction.addMessage({
        id: time,
        sender: "user",
        text: prompt,
      })
    );

    dispatch(
      chatAction.addMessage({
        id: loaderId,
        sender: "bot",
        text: "typing...",
        isLoading: true,
      })
    );
    let res = {
      session_id: "",
      reply: "",
      products: []
    };

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
          text: res.data.reply ?? "No reply, from Agent",
          isLoading: false,
        })
      );

      dispatch(productsAction.addProducts({ products: res.data.products || [] }));
    }
    catch (error) {
      console.error("Error sending message:", error);

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
      
    ],
  },
  reducers: {
    addProducts(state, action) {
      const seenIds = new Set(state.products.map(p => p.id));

      const uniqueProducts = [];

      for (const product of action.payload.products) {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          uniqueProducts.push(product);
        }
      }

      state.products.push(...uniqueProducts);
      console.log(state.products);
    },
  },
});

const storeOffersSlice = createSlice(
  {
    name: "storeOffers",
    initialState: {
      list: [
        
      ],
    },
    reducers: {}
  }
)

const showcaseSlice = createSlice(
  {
    name: "showcase",

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
export const kioskStoreActions = kioskStoreSlice.actions;

const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
    sideBar: toggleSideSlice.reducer,
    products: productsSlice.reducer,
    showcase: showcaseSlice.reducer,
    offers: storeOffersSlice.reducer,
    session: sessionSlice.reducer,
    user: userSlice.reducer,
    kioskStore: kioskStoreSlice.reducer,
  },
});


export default store;
