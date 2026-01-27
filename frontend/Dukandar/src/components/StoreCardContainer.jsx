import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import StoreCard from "./StoreCard";
import { sideBarAction, toggleCardContainersActions, mapListAction } from "../store/store";
import css from "../styles/CardContainer.module.css";

const StoreCardContainer = () => {
  const dispatch = useDispatch();
  const stores = useSelector((store) => store.kioskStoreList.stores);
  // console.log(stores);
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

      {/* 🗺 SHOW ALL STORES ON MAP */}
      <button
        className="btn btn-outline-info mb-3 ms-2"
        onClick={() => {
          dispatch(mapListAction.setStores(stores));
          dispatch(mapListAction.setShowRoutes(false));
        }}
      >
        🗺 Show All Stores
      </button>

      {/* 🚗 ROUTE ALL STORES */}
      <button
        className="btn btn-outline-warning mb-3 ms-2"
        onClick={() => {
          dispatch(mapListAction.setStores(stores));
          dispatch(mapListAction.setShowRoutes(true));
        }}
      >
        🚗 Route All
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
            onClick={() => {
              dispatch(mapListAction.setStores([store]));
              dispatch(mapListAction.setShowRoutes(true));
            }}
          />
        ))}
      </div>
    </div>
  );
};


export default StoreCardContainer;
