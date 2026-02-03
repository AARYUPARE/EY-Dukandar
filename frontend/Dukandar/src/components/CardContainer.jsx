import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Card from "./Card";
import { sideBarAction, showcaseAction, toggleCardContainersActions } from "../store/store";
import css from "../styles/CardContainer.module.css";


const CardContainer = () => {
  const dispatch = useDispatch();
  const {products, canShow} = useSelector((store) => store.products);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(sideBarAction.collapse());
  }, [dispatch]);

  if (!products || products.length === 0 || !canShow) return null;

  const filtered = products.filter((item) =>
    (item.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`container-fluid m-0 ${css["main-container"]}`}>

      {/* 🔁 TOGGLE BUTTON */}
      <button
        className="btn btn-outline-light mb-3"
        onClick={() => dispatch(toggleCardContainersActions.showStores())}
      >
        🏬 View Stores
      </button>

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
