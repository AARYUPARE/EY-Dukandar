import {
  createSlice,
  createAsyncThunk,
  configureStore,
} from "@reduxjs/toolkit";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const BASE_BACKEND_URL = "http://localhost:8080/api"
const CHAT_API_URL = BASE_BACKEND_URL + "/chat";
// const navigate = useNavigate();

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
    wishlist: [

    ]
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
    id: "",
  },
  reducers: {
    setSessionId(state, action) {
      state.id = action.payload;
    }
  }
});

/* =========================
   KIOSK LOGIN
========================= */
export const loginKiosk = createAsyncThunk(
  "auth/loginKiosk",
  async ({ email, password }, { dispatch, getState, rejectWithValue }) => {
    try {
      const id = getState().kioskStore.id;

      const response = await axios.post(
        `${BASE_BACKEND_URL}/login`,
        {
          email,
          password,
          storeType: "kiosk",
          storeId: id
        }
      );

      // console.log(response.data)

      if (response.data.message === "login failed") {
        return false;
      }

      const loggingUser = response.data.user;
      const userWishlist = await axios.get(BASE_BACKEND_URL + `/wishlist/${loggingUser.id}`)

      dispatch(
        userActions.setUser({
          id: loggingUser.id,
          name: loggingUser.name,
          gender: loggingUser.gender,
          DOB: loggingUser.dob,
          email: loggingUser.email,
          phone: loggingUser.phone,
          loyaltyPoints: loggingUser.loyaltyPoints,
          imageUrl: loggingUser.imageUrl,
          pass: "",
          wishlist: userWishlist.data
        })
      );

      let availProductsFromWishList = [];

      dispatch(
        chatAction.addMessage({
          id: "init",
          sender: "bot",
          text: response.data.agentResponse,
          isLoading: false,
          inputState: "text",
          lang: "en"
        }));

      // console.log(response.data.availableWishlist);

      response.data.availableWishlist.forEach(ele => {
        availProductsFromWishList.push(ele.product);
      });

      // console.log(availProductsFromWishList);


      if (availProductsFromWishList.length != 0) {
        dispatch(storeOffersAction.clearStoreOffers());
        dispatch(overlayActions.setOverlayText("You can see products of your wishlist which are available here"))
        dispatch(storeOffersAction.setStoreOffers(availProductsFromWishList))
      }


      // dispatch()
      return true;

    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);


/* =========================
   WEB LOGIN
========================= */
export const loginWeb = createAsyncThunk(
  "auth/loginWeb",
  async ({ email, password }, { dispatch, getState, rejectWithValue }) => {
    try {
      // const { email, password } = getState().user;

      const response = await axios.post(BASE_BACKEND_URL + `/login`, {
        email,
        password,
        storeType: "web"
      });

      if (response.data.message == "login failed") {
        return false;
      }

      const loggingUser = response.data.user;

      const userWishlist = await axios.get(BASE_BACKEND_URL + `/wishlist/${loggingUser.id}`)


      const newAction = {
        id: loggingUser.id,
        name: loggingUser.name,
        gender: loggingUser.gender,
        DOB: loggingUser.dob,
        email: loggingUser.email,
        phone: loggingUser.phone,
        loyaltyPoints: loggingUser.loyaltyPoints,
        imageUrl: loggingUser.imageUrl,
        pass: "",
        wishlist: userWishlist.data
      }

      dispatch(
        chatAction.addMessage({
          id: "init",
          sender: "bot",
          text: response.data.agentResponse,
          isLoading: false,
          inputState: "text",
          lang: "en"
        }));

      dispatch(userActions.setUser(newAction))
      return true;


    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "login failed" });
    }
  }
);

export const sendMessageAsync = createAsyncThunk(
  "chat/sendMessage",
  async (payload, { dispatch, getState }) => {
    const time = Date.now().toString();
    const loaderId = time + "-loader";

    const { prompt, inputState } = payload

    console.log("Input State: " + inputState)

    let sessionState = getState().session || {};
    let sessionId = sessionState.id;

    if (sessionId == "") {
      sessionId = `${getState().user.id}`;
      dispatch(sessionActions.setSessionId(sessionId));
    }

    console.log(sessionId);

    // add user message
    dispatch(
      chatAction.addMessage({
        id: time,
        sender: "user",
        text: prompt,
        inputState,
        lang: "en"
      })
    );

    dispatch(
      chatAction.addMessage({
        id: loaderId,
        sender: "bot",
        text: "typing...",
        isLoading: true,
        inputState,
        lang: "en"
      })
    );

    let res = {
      reply: "",
      products: [],
      stores: [],
      lang: "en"
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
          lang: res.data.user_lang
        })
      );

      dispatch(
        chatAction.updateMessage({
          id: loaderId,
          text: res.data.reply ?? "No reply, from Agent",
          isLoading: false,
          lang: res.data.user_lang
        })
      );
      if (Array.isArray(res.data.products) && res.data.products.length != 0) {
        dispatch(productsAction.addProducts(res.data.products))
        dispatch(toggleCardContainersActions.showProducts());
      }

      if (Array.isArray(res.data.stores) ? res.data.stores.length != 0 : false) {
        dispatch(kioskStoreListActions.addKioskStores({ stores: res.data.stores || [] }));
        dispatch(toggleCardContainersActions.showStores());
      }
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
      const msg = state.messages.find(m => m.id === action.payload.id);

      if (msg) {
        Object.assign(msg, action.payload);
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

const toggleCardContainers = createSlice({
  name: "containertoggle",
  initialState: 1,
  reducers: {
    showProducts() {
      return 1;
    },
    showStores() {
      return 2;
    }
  }
})

const productsSlice = createSlice({
  name: "products",
  initialState: {
    canShow: true,
    products: [
      // {
      //   id: 123,
      //   name: "T-Shirt",
      //   description: "This, is very good t-shirt",
      //   image_url: "https://i5.walmartimages.com/asr/492531f4-6b6c-4aa9-9522-b1d81c2bc493.c7360b4097810e7eede3606cd218764b.jpeg",
      //   brand: "Dukandar",
      //   size: "M"
      // },
      // {
      //   id: 124,
      //   name: "T-Shirt",
      //   description: "This, is very good t-shirt",
      //   image_url: "https://i5.walmartimages.com/asr/492531f4-6b6c-4aa9-9522-b1d81c2bc493.c7360b4097810e7eede3606cd218764b.jpeg",
      //   brand: "Dukandar",
      //   size: "M"
      // }
    ],
  },
  reducers: {
    addProducts(state, action) {
      const seenIds = new Set(state.products.map(p => p.id));

      const uniqueProducts = [];

      for (const product of action.payload) {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          uniqueProducts.push(product);
        }
      }

      state.products.push(...uniqueProducts);
    },

    clearProducts() {
      return { products: [] }
    },

    setCanShow(state, action) {
      state.canShow = action.payload
    }
  },
});

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

const storeOffersSlice = createSlice(
  {
    name: "storeOffers",
    initialState: {
      list: [
        // {
        //   id: 123,
        //   name: "T-Shirt",
        //   description: "This, is very good t-shirt",
        //   image_url: "https://i5.walmartimages.com/asr/492531f4-6b6c-4aa9-9522-b1d81c2bc493.c7360b4097810e7eede3606cd218764b.jpeg",
        //   brand: "Dukandar",
        //   size: "M"
        // },
        // {
        //   id: 123,
        //   name: "T-Shirt",
        //   description: "This, is very good t-shirt",
        //   image_url: "https://i5.walmartimages.com/asr/492531f4-6b6c-4aa9-9522-b1d81c2bc493.c7360b4097810e7eede3606cd218764b.jpeg",
        //   brand: "Dukandar",
        //   size: "M"
        // }
      ],
    },
    reducers: {
      setStoreOffers(state, action) {
        const newOffers = {
          list: action.payload
        }
        return newOffers;
      },
      clearStoreOffers() {
        return { list: [] }
      }
    }
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

const overlaySlice = createSlice({
  name: 'overlay',
  initialState: "",
  reducers:
  {
    setOverlayText(state, action) {
      return action.payload;
    },
    clearOverlay() {
      return "";
    }
  }
})

const mapList = createSlice({
  name: "mapList",
  initialState:
  {
    stores: [],
    showRoutes: false
  },
  reducers:
  {
    setStores(state, action) {
      state.stores = action.payload;
    },
    setShowRoutes(state, action) {
      state.showRoutes = action.payload;
    },
    clearMapList() {
      return {
        stores: [],
        showRoutes: false,
      }
    }
  }
})

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: []
  },
  reducers: {

    // 🔥 Add item (scan or manual add)
    addItem: (state, action) => {
      const item = action.payload;

      const existing = state.items.find(i => i.sku === item.sku);

      if (existing) {
        existing.qty += 1;   // same item → increment
      } else {
        state.items.push({ ...item, qty: 1 });
      }
    },


    // 🔥 Remove item completely
    removeItem: (state, action) => {
      const sku = action.payload;

      state.items = state.items.filter(i => i.sku !== sku);
    },


    // 🔥 Update quantity manually
    updateQty: (state, action) => {
      const { sku, qty } = action.payload;

      const item = state.items.find(i => i.sku === sku);

      if (!item) return;

      if (qty <= 0) {
        state.items = state.items.filter(i => i.sku !== sku);
      } else {
        item.qty = qty;
      }
    },


    // 🔥 Clear cart (after payment)
    clearCart: (state) => {
      state.items = [];
    }

  }
});

export const makePayment = createAsyncThunk(
  "payment/makePayment",
  async ({ upiId }, { dispatch, getState }) => {

    const userId = getState().user.id;
    console.log("make Payment called:" + upiId)

    const response = await axios.post(
      "http://localhost:8080/api/payment/dummy",
      null,
      {
        params: { userId, upiId }
      }
    );

    console.log(response.data)
    return response.data;
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    wantPay: false,
    loading: false,
    status: null,
    error: null,
  },
  reducers: {
    resetPayment: (state) => {
      state.status = null;
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    startPayment(state) {
      state.status = null;
      state.error = null;
      state.wantPay = true;
    },
    closePayment(state) {
      state.wantPay = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(makePayment.pending, (state) => {
        state.loading = true;
        state.status = null;
      })
      .addCase(makePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.paymentStatus;
      })
      .addCase(makePayment.rejected, (state) => {
        state.loading = false;
        state.status = "failed";
        state.error = "Something went wrong";
      });
  },
});

let event = {
  eventType: "",
  data: {}
}

export const backendEventHandler = (msg) => {
  event = JSON.parse(msg.body);
  console.log("Event:", event);

  if (event.eventType == "PAYMENT") {
    store.dispatch(paymentActions.startPayment());
  }
}

export const chatAction = chatSlice.actions;
export const sideBarAction = toggleSideSlice.actions;
export const productsAction = productsSlice.actions;
export const showcaseAction = showcaseSlice.actions;
export const storeOffersAction = storeOffersSlice.actions;
export const sessionActions = sessionSlice.actions;
export const kioskStoreActions = kioskStoreSlice.actions;
export const kioskStoreListActions = kioskStoreListSlice.actions;
export const toggleCardContainersActions = toggleCardContainers.actions;
export const userActions = userSlice.actions;
export const overlayActions = overlaySlice.actions;
export const mapListAction = mapList.actions;
export const cartActions = cartSlice.actions;
export const paymentActions = paymentSlice.actions;

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
    kioskStoreList: kioskStoreListSlice.reducer,
    toggleContainers: toggleCardContainers.reducer,
    overlayText: overlaySlice.reducer,
    mapList: mapList.reducer,
    cart: cartSlice.reducer,
    payment: paymentSlice.reducer,
  },
});


export default store;