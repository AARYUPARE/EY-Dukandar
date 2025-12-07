import ModelDisplay from "./ModelDisplay";
import ProductDetails from "./ProductDetails";
import PriceDetails from "./PriceDetails";
import { useSelector } from "react-redux"
import css from "../styles/ProductDisplay.module.css"

const ProductDisplay = () => {
    const product = useSelector(store => store.showcase);

    if(!product || Object.keys(product).length == 0) return;

    return <div className={`${css["background"]}`}>
        <div className={`${css["display-container"]}`}>
            <ModelDisplay modelUrl={product.modelUrl}></ModelDisplay>
            <ProductDetails details={product.details} title={product.title}/>
            <PriceDetails extraDetails={product.extraDetails}/>
        </div>
    </div>
}

export default ProductDisplay;