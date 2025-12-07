import ModelDisplay from "./ModelDisplay";
import { useSelector } from "react-redux"
import css from "../styles/ProductDisplay.module.css"

const ProductDisplay = () => {
    const grn = useSelector(store => store.grn.grn);

    if (grn == -1) return null;

    //get product details from backend



    return <div className={`${css["background"]}`}>
        <div className={`${css["display-container"]}`}>
            <ModelDisplay></ModelDisplay>
            <div id={`${css["product-details"]}`}></div>
            <div id={`${css["main-info"]}`}></div>
        </div>
    </div>
}

export default ProductDisplay;