export default function Card({ title, imageUrl, description, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="card mb-3"
      style={{ width: "18rem", height: "28rem", cursor: "pointer" }}
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
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View
        </button>
      </div>
    </div>
  );
}
