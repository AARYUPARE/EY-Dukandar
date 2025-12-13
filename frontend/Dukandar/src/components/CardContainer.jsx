import { useDispatch, useSelector } from "react-redux";
import Card from "./Card";
import { useState } from "react";
import { sideBarAction } from "../store/store";

import css from "../styles/CardContainer.module.css";
import { showcaseAction } from "../store/store";

const CardContainer = () => {
    const dispatch = useDispatch();
    const products = useSelector((store) => store.products.products);

    if (!products || products.length === 0) return null;

    const [search, setSearch] = useState("");

    const filtered = products.filter((item) =>
        (item.name ?? "").toLowerCase().includes(search.toLowerCase())
    );
    dispatch(sideBarAction.collapse());

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
                <div className="d-flex  align-items-start" id={`${css["card-list"]}`}>
                    {filtered.map((item, i) => (
                        <Card
                            key={item.id ?? i}
                            title={item.name}
                            image_url={item.image_url}
                            description={item.description ?? ""}
                            onClick={() => dispatch(showcaseAction.setShowcase(item))}
                            brand={item.brand}
                        />
                    ))}
                </div>


            </div>

        </div>
    );
};

export default CardContainer;