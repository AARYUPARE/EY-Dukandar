import css from "../styles/PriceDetails.module.css"

const PriceDetails = ({ extraDetails }) => {
    return <div id={`${css["price-details"]}`}>
        <h5>Original Price: <span style={{ textDecoration: "line-through" }}>{extraDetails.originalPrice}</span>
        </h5>
        <div id={`${css["offer-bubble"]}`}>
            <span className="badge rounded-pill text-bg-light">{extraDetails.offers}</span>
        </div>
        <h5>Final Price: <span >{extraDetails.finalPrice}</span>
        </h5>
    </div>
}

export default PriceDetails