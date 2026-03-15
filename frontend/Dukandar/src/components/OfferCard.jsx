import css from "../styles/OfferCard.module.css";

const OfferCard = ({ offer, gradient }) => {

  return (
    <div className={`${css['offer-card']} ${css[gradient]}`}>

      <div className={`${css["offer-content"]}`}>

        <div className={`${css["offer-title"]}`}>
          {offer.title}
        </div>

        <div className={`${css["offer-description"]}`}>
          {offer.description}
        </div>

        <div className={`${css["offer-validity"]}`}>
          Valid till {offer.validTill}
        </div>

        <button className={`${css["offer-btn"]}`}>
          Apply Offer
        </button>

      </div>

    </div>
  );
};

export default OfferCard;