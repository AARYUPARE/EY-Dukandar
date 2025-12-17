import { useDispatch, useSelector } from "react-redux";
import css from "../styles/OverlayText.module.css";
import { overlayActions } from "../store/store";

const OverlayText = () => {

    let overlayText = useSelector(store => store.overlayText);
    const dispatch = useDispatch()

    if(overlayText == "") return "";

  return (
    <div className={css.overlay}>
      <button className={css.closeBtn} onClick={() => dispatch(overlayActions.clearOverlay())}>✕</button>
      <strong>{overlayText}</strong>
    </div>
  );
};

export default OverlayText;
