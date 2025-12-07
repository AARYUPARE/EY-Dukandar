import css from "../styles/PriceDetails.module.css"

const PriceDetails = ({extraDetails}) => 
{
    return <div id={`${css["price-details"]}`}>
        <h2>Original Price: {extraDetails.originalPrice}</h2>
        <div id={`${css["offer-bubble"]}`}></div>
    </div>
}

export default PriceDetails