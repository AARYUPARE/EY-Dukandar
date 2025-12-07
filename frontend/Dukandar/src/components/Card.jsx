export default function Card({title,imageUrl,description}) 
{
  return (
    <>
      <div className="card mb-3" style={{ width: "18rem", height: "28rem"}}>
        <img src={imageUrl} alt={title} className="card-img-top" style={{ height: "200px", objectFit:"contain", backgroundColor: "#f8f9fa" }}/>

        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{description}</p>
          <button className="btn btn-primary">View</button>
        </div>
      </div>
    </>
  );
}
