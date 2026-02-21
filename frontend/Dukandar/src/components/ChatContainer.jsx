import InputBar from "./InputBar"
import ChatBubble from "./ChatBubble"
import Loader from "./Loader"
import { sendMessageAsync } from "../store/store"
import { useDispatch, useSelector } from "react-redux"
import "../styles/ChatContainer.css"
import { useEffect, useRef } from "react"
import OverlayText from "./OverlayText"

const ChatContainer = () => {

  const dispatch = useDispatch();
  const chatSlice = useSelector(store => store.chat);

  const bottom = useRef(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatSlice.messages]);

  const sendPromt = (prompt, inputState) => {
    let ch = chatSlice.messages.at(-1);
    if (ch && ch.isLoading) {
      return false;
    }
    dispatch(sendMessageAsync({ prompt, inputState }));
    return true;
  }

  return <div className="field-container">

    <div className="chat-title">Dukandar</div>

    <div className="chat-field">
      {/* <ChatBubble message={{
        id: "1234567890",
        sender: "user",
        text: "bhai koi mast jacket dikhao 😎",
        inputState: "Voice",
        lang: "hi"
      }} cls={"user"} key={"Aary"} inputState={"Voice"} />

      <ChatBubble message={{
        id: "1234567891",
        sender: "bot",
        text: `🧥 OPTION 1
                ─────────
                Running Jacket — ₹1299
                ✨ Lightweight and perfect for daily jogging

                👕 OPTION 2
                ─────────
                Cotton T-Shirt — ₹399
                ✨ Soft fabric and best for summer

                👟 OPTION 3
                ─────────
                Sports Shoes — ₹1999
                ✨ Comfortable grip for running and walking`,
        inputState: "Voice",
        lang: "en"
      }} cls={"robot"} key={"A"} inputState={"Voice"} /> */}


      {chatSlice.messages.map((m) => {
        return m.sender == "user"
          ? <ChatBubble message={m} cls="user" key={m.id} inputState={m.inputState} />
          : m.isLoading
            ? <Loader key={m.id} />
            : <ChatBubble message={m} cls="robot" key={m.id} inputState={m.inputState} />
      })}
      <div ref={bottom}></div>
    </div>

    <InputBar sendPromt={sendPromt} />
  </div>
}

export default ChatContainer;