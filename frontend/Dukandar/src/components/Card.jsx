import "../styles/Card.css";
import Tilty from "../utils/Tilty.jsx";   // <-- add this import

export default function Card({ title, image_url, description, onClick, brand, size}) {

  if(!size) size = "";

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
      {/* <!-- inspo: Camden @ https://x.com/Designownow_/status/1921052041520041991 --> */}

<div className="card" onClick={onClick}>
		<div className="icon">
			<img src={`${image_url}`} alt="" />
		</div>
	<div className="content">
		<div className="bottom">
			<h4>{title}</h4>
			<p className="description">{description}</p>
		</div>
	</div>
</div>
    </Tilty>
  );
}
