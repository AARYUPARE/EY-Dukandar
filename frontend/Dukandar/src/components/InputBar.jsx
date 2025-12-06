import { useRef } from "react";
import "../styles/InputBar.css"
import { IoMdSend } from "react-icons/io";

const InputBar = ({sendPromt}) => {
    let prompt = useRef();

    const handleOnClick = () => 
    {
        if(prompt.current.value == "") return;
        console.log("Handle Clicked")

        // Code to send prompt to backend and receive responce
        sendPromt(prompt.current.value);
        prompt.current.value = "";
    }

    return <>
        <div className="input-group mb-3" id="input-bar">
            <input type="text" className="form-control" placeholder="Recipient’s username" aria-label="Recipient’s username" aria-describedby="button-addon2" id="text-field" ref={prompt}/>
            <button className="btn btn-outline-secondary" type="button" id="submit-button" onClick={handleOnClick}><IoMdSend /></button>
        </div>
    </>
}

export default InputBar;