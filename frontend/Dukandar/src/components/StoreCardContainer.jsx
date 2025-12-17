import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import StoreCard from "./StoreCard";
import { sideBarAction, toggleCardContainersActions } from "../store/store";
import css from "../styles/CardContainer.module.css";

const StoreCardContainer = () => {
  const dispatch = useDispatch();
  const stores = useSelector((store) => store.kioskStoreList.stores);
  console.log(stores);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(sideBarAction.collapse());
  }, [dispatch]);

  // if (!stores || stores.length === 0) return null;

  const filtered = stores.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`container-fluid m-0 ${css["main-container"]}`}>

      {/* 🔁 TOGGLE BUTTON */}
      <button
        className="btn btn-outline-light mb-3"
        onClick={() => dispatch(toggleCardContainersActions.showProducts())}
      >
        🛍 View Products
      </button>

      <input
        className="form-control mb-4"
        type="text"
        placeholder="Search stores..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="d-flex align-items-start" id={css["card-list"]}>
        {filtered.map((store) => (
          <StoreCard
            key={store.id}
            name={store.name}
            imageUrl={store.imageUrl}
            address={store.address}
            phone={store.phone}
            onClick={() => console.log("Store selected:", store)}
          />
        ))}
      </div>
    </div>
  );
};


export default StoreCardContainer;
