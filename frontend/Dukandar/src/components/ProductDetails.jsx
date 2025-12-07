import css from "../styles/ProductDetails.module.css"

const ProductDetails = ({details, title}) =>
{
    return <div id={`${css["product-details"]}`}>
        <div id={`${css["product-title"]}`}>
        <h2>{title}</h2>
        <p className="m-0">{details.summary}</p>
        </div>
        <div id={`${css["product-straigths"]}`}>
            <h6>Strengths: </h6>
            <ul>
                {details.strengths.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
        </div>
        <div id={`${css["product-description"]}`}>
            <h6>Description: </h6>
        </div>
    </div>
}

export default ProductDetails