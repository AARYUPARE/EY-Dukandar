import { useSelector } from "react-redux";
import Card from "./Card";
import { useState } from "react";

const CardContainer = () => {
    const [search, setSearch] = useState("");

    const products = useSelector(store => store.products.products);

    const filtered = (products).filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return <>
        <div className="container-fluid p-0 m-0">   

            <input
                className="form-control mb-4"
                type="text"
                placeholder="Search for items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="d-flex flex-column align-items-start">
                {filtered.map((item) => (
                    <Card title={item.title} imageUrl={item.image} description={item.description} key={item.id}/>
                ))}
            </div>

        </div>
    </>
}

export default CardContainer;