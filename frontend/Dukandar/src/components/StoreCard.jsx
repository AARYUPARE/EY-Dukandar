import "../styles/Card.css";
import Tilty from "../utils/Tilty.jsx";

export default function StoreCard({
  name,
  imageUrl,
  address,
  phone,
  onClick,
}) {
  return (
    <Tilty
      max={25}
      glare={true}
      maxGlare={0.4}
      scale={1.05}
      speed={400}
      perspective={1200}
      className="tilt-wrapper"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        className="card mb-3"
        id="card-container"
      >
        <img
          src={imageUrl}
          alt={name}
          className="card-img-top"
          style={{
            height: "200px",
            objectFit: "cover",
            backgroundColor: "#f8f9fa",
          }}
        />

        <div className="card-body">
          <h5 className="card-title">{name}</h5>
          <p className="card-text">📍 {address}</p>
          <p className="card-text">📞 {phone}</p>
        </div>
      </div>
    </Tilty>
  );
}
