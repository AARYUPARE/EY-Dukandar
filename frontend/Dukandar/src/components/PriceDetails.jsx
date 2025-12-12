import css from "../styles/PriceDetails.module.css"

const PriceDetails = ({ price }) => {
    return <div id={`${css["price-details"]}`}>
        {/* <h5>Original Price: <span style={{ textDecoration: "line-through" }}>{price}</span>
        </h5>
        <div id={`${css["offer-bubble"]}`}>
            <span className="badge rounded-pill text-bg-light">{extraDetails.offers}</span>
        </div> */}
        <h5>Final Price: <span >{price}</span>
        </h5>
    </div>
}

export default PriceDetails