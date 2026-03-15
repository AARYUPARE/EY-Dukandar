import Card from "./Card";
import css from "../styles/ProductCard.module.css";

export default function ProductCard({
  detail,
  onButtonClick,
  cardTitle,
  image_url,
  cardDescription,
  onCardClick
}) {

  return (
    <div className={`${css["product-card"]}`}>

      <div className={`${css["product-left"]}`}>
        {detail}
      </div>

      <div className={`${css["product-right"]}`}>

        <Card
          title={cardTitle}
          image_url={image_url}
          description={cardDescription}
          onClick={onCardClick}
        />

      </div>

    </div>
  );
}