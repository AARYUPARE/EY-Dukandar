import { useDispatch, useSelector } from "react-redux";
import Card from "./Card";
import { useState } from "react";
import { showcaseAction } from "../store/store";

import css from "../styles/OfferContainer.module.css";

const OffersContainer = () => {
    const dispatch = useDispatch();

    // Use OFFERS instead of PRODUCTS
    const offers = useSelector((store) => store.offers.list);

    if (!offers || offers.length === 0) return null;

    const [search, setSearch] = useState("");

    const filtered = offers.filter((item) =>
        (item.title ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`container-fluid m-0 ${css["main-container"]}`}>
            <input
                className="form-control mb-4"
                type="text"
                placeholder="Search offline offers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="d-flex align-items-start" id={css["card-list"]}>
                {filtered.map((item, i) => (
                    <Card
                        key={item.id ?? i}
                        title={item.title}
                        imageUrl={item.image}
                        description={item.details?.summary ?? ""}
                        onClick={() => dispatch(showcaseAction.setShowcase(item))}
                    />
                ))}
            </div>
        </div>
    );
};

export default OffersContainer;
