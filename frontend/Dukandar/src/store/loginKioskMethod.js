import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { userActions, BASE_BACKEND_URL, chatAction, storeOffersAction, overlayActions } from "./store";


/* =========================
   KIOSK LOGIN
========================= */
const loginKiosk = createAsyncThunk(
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

export default loginKiosk