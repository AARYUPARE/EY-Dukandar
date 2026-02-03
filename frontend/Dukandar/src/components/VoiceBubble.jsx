import { FaVolumeUp } from "react-icons/fa";
import css from "../styles/VoiceBubble.module.css"

const VoiceBubble = ({ text, lang }) => {

    const speak = () => {
        const utter = new SpeechSynthesisUtterance(text);

        // language mapping
        const map = {
            hi: "hi-IN",
            mr: "mr-IN",
            en: "en-US"
        };

        utter.lang = map[lang] || "en-US";

        window.speechSynthesis.cancel(); // stop previous
        window.speechSynthesis.speak(utter);
    };

    return (
        <div className={`${css["voice-bubble"]}`}>
            <button className={`${css["play-btn"]}`} onClick={speak}>
                <FaVolumeUp />
            </button>
        </div>
    );
};

export default VoiceBubble;
