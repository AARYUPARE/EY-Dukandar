import { IoIosPlay } from "react-icons/io";
import { IoPauseSharp } from "react-icons/io5";
import css from "../styles/VoiceBubble.module.css"
import { useState } from "react";

const cleanForSpeech = (text) => {
    return text
        // remove emojis
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")

        // remove fancy separators
        .replace(/[─—–-]{2,}/g, " ")

        // replace ₹ nicely
        .replace(/₹/g, " rupees ")

        // collapse spaces
        .replace(/\s+/g, " ")
        .trim();
};

const VoiceBubble = ({ text, lang, user }) => {

    console.log("Voice Bubble: " + lang)
    const [isPlaying, setIsPlaying] = useState(false)

    const speak = () => {
        const cleanText = cleanForSpeech(text);
        const utter = new SpeechSynthesisUtterance(cleanText);

        // language mapping
        const map = {
            hi: "hi-IN",
            mr: "mr-IN",
            en: "en-IN",
        };

        utter.lang = map[lang] || "en-IN";
        console.log("User Language: " + utter.lang)
        utter.onstart = () => setIsPlaying(true);
        utter.onend = () => setIsPlaying(false);

        window.speechSynthesis.cancel(); // stop previous
        window.speechSynthesis.speak(utter);
        setIsPlaying(true)
    };

    const pause = () => {
        window.speechSynthesis.cancel(); // stop
        setIsPlaying(false)
    }

    return (
        <div className={`${css["voice-bubble"]}`}>
            {!isPlaying ?
                <button className={`${css["play-btn-black"]}`} onClick={speak}>
                    <IoIosPlay />
                </button>
                :
                <button className={`${css["play-btn-black"]}`} onClick={pause}>
                    <IoPauseSharp />
                </button>}
            <hr className={`${css["slide-bar"]}`} />
        </div>
    );
};

export default VoiceBubble;
