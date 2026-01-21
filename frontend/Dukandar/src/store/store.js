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
    id: 1,
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

      // console.log(response.data.availableWishlist);

      response.data.availableWishlist.forEach(ele => {
        availProductsFromWishList.push(ele.product);
      });

      // console.log(availProductsFromWishList);

      
      if(availProductsFromWishList.length != 0)
      {
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

      dispatch(userActions.setUser(newAction))
      return true;


    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "login failed" });
    }
  }
);

export const sendMessageAsync = createAsyncThunk(
  "chat/sendMessage",
  async ({ prompt }, { dispatch, getState }) => {
    const time = Date.now().toString();
    const loaderId = time + "-loader";

    let sessionState = getState().session || {};
    let sessionId = sessionState.id;

    if (sessionId == "") {
      sessionId = Date.now().toString();
      dispatch(sessionActions.setSessionId(sessionId));
    }

    console.log(sessionId);

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
      products: [],
      stores: [],
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

      if (Array.isArray(res.data.products) ? res.data.products.length != 0 && res.data.products.length > 4: false) {
        dispatch(productsAction.clearProducts())
      }
      dispatch(productsAction.addProducts({ products: res.data.products || [] }));

      if (Array.isArray(res.data.stores) ? res.data.stores.length != 0 : false) {
        dispatch(kioskStoreListActions.clearKioskStores());
        dispatch(kioskStoreListActions.addKioskStores({ stores: res.data.stores || [] }));
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
    },

    clearProducts()
    {
      return { products: [] }
    }
  },
});

const kioskStoreListSlice = createSlice({
  name: "kioskStoreList",
  initialState: {
    stores: [

    ],
  },
  reducers: {
    addKioskStores(state, action) {

      // if(!action.payload.stores) return;

      state.stores.push(...action.payload.stores);
    },
    clearKioskStores()
    {
      return {stores:[]}
    }
  },
});

const storeOffersSlice = createSlice(
  {
    name: "storeOffers",
    initialState: {
      list: [

      ],
    },
    reducers: {
      setStoreOffers(state, action) {
        const newOffers = {
          list: action.payload
        }
        return newOffers;
      },
      clearStoreOffers()
      {
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
    setOverlayText(state, action)
    {
      return action.payload;
    },
    clearOverlay()
    {
      return "";
    }
  }
})

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
    overlayText: overlaySlice.reducer
  },
});


export default store;
