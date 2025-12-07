import ModelDisplay from "./ModelDisplay";
import ProductDetails from "./ProductDetails";
import { useDispatch, useSelector } from "react-redux";
import css from "../styles/ProductDisplay.module.css";
import { showcaseAction } from "../store/store"; // adjust path if needed

const ProductDisplay = () => {
  const dispatch = useDispatch();
  const product = useSelector((store) => store.showcase);

  if (!product || Object.keys(product).length === 0) return null;

  return (
    <div
      className={`${css["background"]}`}
      onClick={() => dispatch(showcaseAction.clearShowcase())}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`${css["display-container"]}`}
        
      >
        

        <ModelDisplay modelUrl={product.modelUrl}></ModelDisplay>
        <ProductDetails details={product.details} title={product.title} />
        <div id={`${css["price-details"]}`}></div>
      </div>
    </div>
  );
};

export default ProductDisplay;
