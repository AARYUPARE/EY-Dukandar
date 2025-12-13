import css from "../styles/ProductDetails.module.css"

const ProductDetails = ({ description, title, brand, category, sub_category }) => {
    return <div id={`${css["product-details"]}`}>
        <div id={`${css["product-title"]}`}>
            <h2>{title}</h2>
            <p className="m-0">{brand}</p>
        </div>
        <div id={`${css["product-straigths"]}`}>
            <h6>Main Catogory: </h6>
            <p>{category}</p>
            <h6>Sub Catogory: </h6>
            <ul>
                {sub_category.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
        </div>
        <div id={`${css["product-description"]}`}>
            <h6>Description: </h6>
            <p id={`${css["product-description-text"]}`}>{description}</p>
        </div>
    </div>
}

export default ProductDetails