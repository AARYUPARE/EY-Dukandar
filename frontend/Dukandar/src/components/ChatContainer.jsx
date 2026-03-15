import InputBar from "./InputBar"
import ChatBubble from "./ChatBubble"
import Loader from "./Loader"
import { sendMessageAsync } from "../store/sendMessageAsync"
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