import "../styles/Card.css"
export default function Card({ title, imageUrl, description, onClick }) {

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="card mb-3"
      style={{  }}
      id="card-container"
    >
      <img
        src={imageUrl}
        alt={title}
        className="card-img-top"
        style={{ height: "200px", objectFit: "contain", backgroundColor: "#f8f9fa" }}
      />

      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        
      </div>
    </div>
  );
}
