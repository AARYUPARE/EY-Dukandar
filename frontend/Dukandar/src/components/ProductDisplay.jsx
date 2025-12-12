import ModelDisplay from "./ModelDisplay";
import ProductDetails from "./ProductDetails";
import PriceDetails from "./PriceDetails";
import { showcaseAction } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import css from "../styles/ProductDisplay.module.css";

const ProductDisplay = () => {
    const product = useSelector((store) => store.showcase);
    const dispatch = useDispatch();

    const handelClose = () =>
    {
        dispatch(showcaseAction.clearShowcase())
    }

    if (!product || Object.keys(product).length === 0) return null;

    return (
        <div className={css.background}>
            
            {/* FIXED FLOATING CLOSE BUTTON */}
            <button className={css.closeBtn} onClick={handelClose}>×</button>

            <div className={css["display-container"]}>
                <ModelDisplay modelUrl={product.modelUrl} />
                <ProductDetails description={product.description} title={product.name} category={product.category} subCategory={product.subCategory} brand={product.brand}/>
                <PriceDetails price={product.price} />
            </div>

        </div>
    );
};

export default ProductDisplay;
