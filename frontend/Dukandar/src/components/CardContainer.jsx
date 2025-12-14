import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Card from "./Card";
import { sideBarAction, showcaseAction } from "../store/store";
import css from "../styles/CardContainer.module.css";

const CardContainer = () => {
  const dispatch = useDispatch();
  const products = useSelector((store) => store.products.products);

  // ✅ hooks ALWAYS at top
  const [search, setSearch] = useState("");

  // ✅ side-effect inside useEffect
  useEffect(() => {
    dispatch(sideBarAction.collapse());
  }, [dispatch]);

  if (!products || products.length === 0) return null;

  const filtered = products.filter((item) =>
    (item.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`container-fluid m-0 ${css["main-container"]}`}>
      <input
        className="form-control mb-4"
        type="text"
        placeholder="Search for items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="d-flex align-items-start" id={css["card-list"]}>
        {filtered.map((item, i) => (
          <Card
            key={item.id ?? i}
            title={item.name}
            image_url={item.image_url}
            description={item.description ?? ""}
            brand={item.brand}
            onClick={() => dispatch(showcaseAction.setShowcase(item))}
          />
        ))}
      </div>
    </div>
  );
};

export default CardContainer;
