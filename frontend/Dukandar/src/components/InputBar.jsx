import { useRef } from "react";
import { IoMdSend } from "react-icons/io";
import { useDispatch } from "react-redux";
import { sideBarAction } from "../store/store";
import "../styles/InputBar.css"

const InputBar = ({ sendPromt }) => {
    let prompt = useRef();
    let dispatch = useDispatch();

    const handleOnClick = () => {
        if (prompt.current.value == "") return;

        // Code to send prompt to backend and receive responce
        sendPromt(prompt.current.value);
        prompt.current.value = "";
        dispatch(sideBarAction.collapse());
    }

    return <>
        <div className="input-group mb-3" id="input-bar">
            <input type="text" className="form-control" placeholder="Recipient’s username" aria-label="Recipient’s username" aria-describedby="button-addon2" id="text-field" ref={prompt} />
            <button className="btn btn-outline-secondary" type="button" id="submit-button" onClick={handleOnClick}><IoMdSend /></button>
        </div>
    </>
}

export default InputBar;