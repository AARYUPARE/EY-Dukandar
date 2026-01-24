import "../styles/ChatBubble.css";

const ChatBubble = ({ message, cls }) => {
    const isUser = cls && cls.toLowerCase().includes("user");

    return (
        <div className={`message-container ${isUser ? "align-right" : "align-left"}`}>
            <div className={`chat-bubble ${isUser ? "user" : "robot"}`}>
                {message.text}
            </div>
        </div>
    );
};

export default ChatBubble;
