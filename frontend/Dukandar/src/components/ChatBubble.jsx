import VoiceBubble from "./VoiceBubble";
import "../styles/ChatBubble.css";
import ProductsContainer from "./ProductContainer";
import OfferCardsContainer from "./OfferCardsContainer";

const UserBubble = (message) => {
    return (
        <>
            <div className={`chat-bubble user`}>
                {message.text}
            </div>
        </>
    )
}

const RobotBubble = (message) => {

    const getTypeRender = (type) => 
    {
        if(type == null || type == "NONE")
        {
            return <></>
        }
        if(type == "SHOW_PRODUCT")
        {
            return <ProductsContainer />
        }
        else if (type == "SHOW_OFFERS")
        {
            return <OfferCardsContainer />
        }
    }

    return (
        <>
            <div className={`chat-bubble robot`}>
                {message.text}
                {getTypeRender(message.type)}
            </div>
        </>
    )
}

const ChatBubble = ({ message, cls, inputState }) => {
    const isUser = cls && cls.toLowerCase().includes("user");

    return (
        <div className={`message-container ${isUser ? "align-right" : "align-left"}`}>
            {inputState === "Voice" && <VoiceBubble text={message.text} user={message.sender} lang={message.lang}/>}  
            {isUser ? <UserBubble /> : <RobotBubble />}
        </div>
    );
};

export default ChatBubble;
