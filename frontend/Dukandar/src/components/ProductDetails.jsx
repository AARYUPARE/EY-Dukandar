import css from "../styles/ProductDetails.module.css"

const ProductDetails = ({details, title}) =>
{
    return <div id={`${css["product-details"]}`}>
        <h2 id={`${css["product-title"]}`}>{title}</h2>
        <div id={`${css["product-straigths"]}`}>
            <h6>Strengths: </h6>
            <ul>
                {details.strengths.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
        </div>
    </div>
}

export default ProductDetails