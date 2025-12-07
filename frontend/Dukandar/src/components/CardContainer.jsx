import { useSelector } from "react-redux";
import Card from "./Card";
import { useState } from "react";
import css from "../styles/CardContainer.module.css"

const CardContainer = () => {
    const products = useSelector(store => store.products.products);

    if (!products || products.length == 0) return "";

    const [search, setSearch] = useState("");

    const filtered = (products).filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return <div>
        <div className={`container-fluid m-0 ${css["main-container"]}`}>
            <input
                className="form-control mb-4"
                type="text"
                placeholder="Search for items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="d-flex flex-column align-items-start">
                {filtered.map((item, i) => {
                    return <Card title={item.title} imageUrl={item.image} description={item.details.summary} key={i} />
                })}
            </div>

        </div>
    </div>
}

export default CardContainer;