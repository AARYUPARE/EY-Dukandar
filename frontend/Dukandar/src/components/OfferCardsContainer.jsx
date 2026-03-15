import css from "../styles/OfferCardsContainer.module.css";
import OfferCard from "./offerCard";

const OfferCardsContainer = () => {

    const offers = [
        {
            title: "Flat ₹200 OFF",
            description: "On orders above ₹999",
            validTill: "30 Oct"
        },
        {
            title: "20% Discount",
            description: "On Nike shoes",
            validTill: "12 Nov"
        },
        {
            title: "Buy 1 Get 1",
            description: "On selected items",
            validTill: "5 Nov"
        }
    ];

    const gradients = [
        "grad1",
        "grad2",
        "grad3",
        "grad4",
        "grad5"
    ];

    return (
        <div className={`${css["offers-container"]}`}>

            {offers.map((offer, index) => (
                <OfferCard
                    key={index}
                    offer={offer}
                    gradient={gradients[index % gradients.length]}
                />
            ))}

        </div>
    );
};

export default OfferCardsContainer;