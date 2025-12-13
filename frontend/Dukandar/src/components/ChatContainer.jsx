import InputBar from "./InputBar"
import ChatBubble from "./ChatBubble"
import Loader from "./Loader"
import { sendMessageAsync } from "../store/store"
import { useDispatch, useSelector } from "react-redux"
import "../styles/ChatContainer.css"
import { useEffect, useRef } from "react"

const ChatContainer = () => {    
    
    const dispatch = useDispatch();
    const chatSlice = useSelector(store => store.chat);

    const bottom = useRef(null);
    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatSlice.messages]);

    const sendPromt = (prompt) => 
    {
<<<<<<< HEAD
        console.log("Dispatching prompt:", prompt);
=======
        let ch=chatSlice.messages.at(-1);
        if(ch && ch.isLoading)
        {
            return false;
        }

>>>>>>> 464fc68f8e4903a5d12fd159661bd310ff4bf80b
        dispatch(sendMessageAsync({ prompt: prompt }));
        return true;
    }

    return <div className="field-container">
        <div className="chat-field">
            {chatSlice.messages.map((m) => {
                return m.sender == "user" ? <ChatBubble message={m} cls="user-message" key={m.id} /> : m.isLoading ? <Loader key={m.id} /> : <ChatBubble message={m} cls="robot-message" key={m.id} />
            }
            )}
            <div ref={bottom}></div>
        </div>

        <InputBar sendPromt={sendPromt}></InputBar>
    </div>
}

export default ChatContainer;