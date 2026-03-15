import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { chatAction } from "./store";


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

    dispatch(
      chatAction.addMessage({
        id: response.data.id,
        sender: "bot",
        text: response.data.reply ?? "Payment Done",
        isLoading: false,
        inputState: "text",
        lang: "en"
      })
    );

    return response.data;
  }
);