import {  configureStore } from "@reduxjs/toolkit";

export const BASE_BACKEND_URL = "http://localhost:8080/api"
export const CHAT_API_URL = BASE_BACKEND_URL + "/chat";

import userSlice from "./userSlice";
import kioskStoreSlice from "./kioskStoreSlice";
import chatSlice from "./chatSlice";
import toggleSideSlice from "./toggleSideSlice";
import toggleCardContainers from "./toggleCardContainer";
import sessionSlice from "./sessionSlice";
import productsSlice from "./productsSlice";
import kioskStoreListSlice from "./kioskStoreListSlice";
import storeOffersSlice from "./storeOffersSlice";
import showcaseSlice from "./showcaseSlice";
import overlaySlice from "./overlaySlice";
import mapList from "./mapListSlice";
import cartSlice from "./cartSlice";
import paymentSlice from "./paymentSlice";


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

export const getBrandFromExtension = () => {
  return new Promise((resolve) => {

    const handler = (event) => {
      if (event.data.type === "BRAND_CONTEXT") {
        window.removeEventListener("message", handler);
        resolve(event.data.brand);
      }
    };

    window.addEventListener("message", handler);

    window.postMessage({ type: "GET_BRAND" }, "*");
  });
};

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