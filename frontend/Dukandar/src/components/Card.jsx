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

<div class="card">
	
		<div class="icon">
			<img src={`${image_url}`} alt="" />
		</div>
	<div class="content">
		<div class="bottom">
			<h4>{title}</h4>
			<p className="description">{description}</p>
		</div>
	</div>
</div>
    </Tilty>
  );
}
