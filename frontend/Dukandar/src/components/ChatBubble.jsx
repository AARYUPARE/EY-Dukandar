import "../styles/ChatBubble.css"

const ChatBubble = ({message, cls}) => 
{
    return<div className="message-container">
        <div className={cls}>
            {message.text}
        </div>
    </div>
}

export default ChatBubble;