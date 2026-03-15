import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { sessionActions, chatAction, CHAT_API_URL, productsAction, toggleCardContainersActions, kioskStoreListActions } from "./store";
import responceEventHandler from "./responseEventHandler";

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
      event: {
        type: "",
        payload:{

        },
        user_lang: ""
      }
    };

    try {
      res = await axios.post(CHAT_API_URL, {
        userId: getState().user.id,
        sessionId: sessionId,
        message: prompt,
      }).data;

      // Update loader message to real response text
      dispatch(
        chatAction.updateMessage({
          id: loaderId,
          text: (res.reply === "__blank__") ? "" : res.reply ?? "No reply, from Agent",
          isLoading: false,
          lang: res.user_lang,
          renderType: res.event.type
        })
      );

        responceEventHandler(res.event, dispatch)

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