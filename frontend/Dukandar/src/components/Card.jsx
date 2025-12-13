import "../styles/Card.css";
import Tilty from "../utils/Tilty.jsx";   // <-- add this import

export default function Card({ title, image_url, description, onClick, brand }) {
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
          src={image_url}
          alt={title}
          className="card-img-top"
          style={{
            height: "200px",
            objectFit: "contain",
            backgroundColor: "#f8f9fa",
          }}
        />

        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">Brand: {brand}</p>
          <p className="card-text">{description}</p>
        </div>
      </div>
    </Tilty>
  );
}
