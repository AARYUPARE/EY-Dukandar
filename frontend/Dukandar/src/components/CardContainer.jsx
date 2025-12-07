import { useDispatch, useSelector } from "react-redux";
import Card from "./Card";
import { useState } from "react";
import css from "../styles/CardContainer.module.css";
import { showcaseAction } from "../store/store";

const CardContainer = () => {
  const dispatch = useDispatch();
  const products = useSelector((store) => store.products.products);

  if (!products || products.length === 0) return null;

  const [search, setSearch] = useState("");

  const filtered = products.filter((item) =>
    (item.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={`container-fluid m-0 ${css["main-container"]}`}>
        <input
          className="form-control mb-4"
          type="text"
          placeholder="Search for items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="d-flex flex-column align-items-start">
          {filtered.map((item, i) => (
            <Card
              key={item.grn ?? i}
              title={item.title}
              imageUrl={item.image}
              description={item.details?.summay ?? ""}
              onClick={() => dispatch(showcaseAction.setShowcase(item))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardContainer;