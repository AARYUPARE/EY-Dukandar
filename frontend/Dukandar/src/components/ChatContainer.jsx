import InputBar from "./InputBar"
import ChatBubble from "./ChatBubble"
import Loader from "./Loader"
import { sendMessageAsync } from "../store/store"
import { useDispatch, useSelector } from "react-redux"
import "../styles/ChatContainer.css"

const ChatContainer = () => {

    const dispatch = useDispatch();
    const chatSlice = useSelector(store => store.chat);

    const sendPromt = (prompt) => {
        console.log("Send message")
        dispatch(sendMessageAsync({ prompt: prompt }));
    }

    return <>
        <div className="chat-field">
            {chatSlice.messages.map((m) => 
            {
                return m.sender == "user" ? <ChatBubble message={m} cls="user-message" key={m.id}/> : m.isLoading ? <Loader key={m.id}/> : <ChatBubble message={m} cls="robot-message" key={m.id}/>
            }
            )}
        </div>
        <InputBar sendPromt={sendPromt}></InputBar>
    </>
}

export default ChatContainer;