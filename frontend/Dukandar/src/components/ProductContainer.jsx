import ProductCard from "./ProductCard";
import css from "../styles/ProductsContainer.module.css";
import { useDispatch } from "react-redux";
import { showcaseAction } from "../store/store";

export default function ProductsContainer() {

    const { products, details } = useSlice(store => store.products)
    const dispatch = useDispatch()

    return (
        <div className={`${css["products-container"]}`}>

            {products.map((product, index) => (

                <ProductCard
                    key={index}
                    details={details[index]}
                    cardDescription={product.cardDescription}
                    onCardClick={() => dispatch(showcaseAction.setShowcase(product))}
                />

            ))}

        </div>
    );
}