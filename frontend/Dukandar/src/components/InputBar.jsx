import { useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import "../styles/InputBar.css";

const InputBar = ({ sendPromt }) => {
    const prompt = useRef(null);
    const [listening, setListening] = useState(false);

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = SpeechRecognition
        ? new SpeechRecognition()
        : null;

    if (recognition) {
        recognition.continuous = false; // auto stop
        recognition.lang = "mr-IN"
        recognition.interimResults = false;
    }

    // ------------------------
    // 🎙️ Mic start
    // ------------------------
    const startListening = () => {
        if (!recognition) return;

        setListening(true);

        console.log("🎤 Listening...");

        recognition.start();

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;

            console.log("🗣️ Converted:", text);
            handleSend(text, "Voice");
        };

        recognition.onend = () => {
            setListening(false); // auto hide overlay
            console.log("🛑 Stopped listening");
        };

        recognition.onerror = (e) => {
            setListening(false);
            console.log("Speech error:", e);
        };
    };

    const handleSend = (message, inputState) => {
        if (!message) return;
        console.log("handle Method: " + inputState);
        sendPromt(message, inputState);
        prompt.current.value = "";
    };

    return (
        <>
            {/* 🔥 Listening overlay */}
            {listening && (
                <div className="voice-overlay">
                    <div className="voice-orb">🎙️ Listening...</div>
                </div>
            )}

            <div className="input-bar">
                <input
                    ref={prompt}
                    type="text"
                    className="input-field"
                    placeholder="Ask anything…"
                    onKeyDown={(e) => e.key === "Enter" && handleSend(prompt.current.value, "Text")}
                />

                <button className="mic-btn" onClick={startListening}>
                    <FaMicrophone />
                </button>

                <button className="send-btn" onClick={() => handleSend(prompt.current.value, "Text")}>
                    <IoMdSend />
                </button>
            </div>
        </>
    );
};

export default InputBar;
