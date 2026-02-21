import VoiceBubble from "./VoiceBubble";
import "../styles/ChatBubble.css";

const ChatBubble = ({ message, cls, inputState }) => {
    const isUser = cls && cls.toLowerCase().includes("user");

    return (
        <div className={`message-container ${isUser ? "align-right" : "align-left"}`}>
            <div className={`chat-bubble ${isUser ? "user" : "robot"}`}>
                {inputState === "Voice" && <VoiceBubble text={message.text} user={message.sender} lang={message.lang}/>}  
                {message.text}
            </div>
        </div>
    );
};

export default ChatBubble;
