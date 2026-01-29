import { useRef } from "react";
import { IoMdSend } from "react-icons/io";
import "../styles/InputBar.css";

const InputBar = ({ sendPromt }) => {
    const prompt = useRef(null);

    const handleOnClick = () => {
        if (!prompt.current.value) return;

        const sent = sendPromt(prompt.current.value);
        if (!sent) return;

        prompt.current.value = "";
    };

    return (
        <div className="input-bar">
            <input
                ref={prompt}
                type="text"
                className="input-field"
                placeholder="Ask anything…"
                onKeyDown={(e) => e.key === "Enter" && handleOnClick()}
            />
            <button className="send-btn" onClick={handleOnClick}>
                <IoMdSend />
            </button>
        </div>
    );
};

export default InputBar;