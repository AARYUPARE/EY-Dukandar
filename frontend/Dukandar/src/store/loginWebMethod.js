import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_BACKEND_URL, chatAction, userActions, getBrandFromExtension } from "./store";

/* =========================
   WEB LOGIN
========================= */
const loginWeb = createAsyncThunk(
  "auth/loginWeb",
  async ({ email, password }, { dispatch, getState, rejectWithValue }) => {
    try {
      // const { email, password } = getState().user;
      const brand = await getBrandFromExtension();

      const response = await axios.post(BASE_BACKEND_URL + `/login`, {
        email,
        password,
        storeType: "web",
        brand: brand
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

export default loginWeb