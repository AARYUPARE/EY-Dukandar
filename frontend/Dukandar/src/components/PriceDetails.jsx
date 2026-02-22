import css from "../styles/PriceDetails.module.css"

const PriceDetails = ({ price, productLink }) => {

    const goToProductLink = () => {

        console.log("Product link clicked")

        window.postMessage({
            type: "REDIRECT_TAB",
            url: productLink
        }, "*");
    }


    return <div id={`${css["price-details"]}`}>
        <h5>Final Price: <span >{price}</span>
        </h5>
        <button className={`${css['product-link']}`} onClick={goToProductLink}>Product Link</button>
    </div>
}

export default PriceDetails