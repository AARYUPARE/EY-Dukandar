import { useDispatch, useSelector } from "react-redux";
import Card from "./Card";
import { useEffect, useState } from "react";
import { showcaseAction, storeOffersAction } from "../store/store";
import { BASE_BACKEND_URL } from "../store/store";
import OverlayText from "./OverlayText";

import css from "../styles/OfferContainer.module.css";
import axios from "axios";

const OffersContainer = () => {
    const dispatch = useDispatch();

    // Use OFFERS instead of PRODUCTS
    const offers = useSelector((store) => store.offers.list);
    const kioskStore = useSelector(store => store.kioskStore);

    const [search, setSearch] = useState("");

    useEffect(() => {

        const fetchStoreProducts = async () => {
            try {
                let res = await axios(BASE_BACKEND_URL + `/inventory/available`,
                    {
                        params:
                        {
                            storeId: kioskStore.id
                        }
                    }
                )
                console.log('res: ', res)

                let products = [];

                for (let ele of res.data) {
                    let item = await axios(BASE_BACKEND_URL + `/products/${ele.productId}`)
                    item.data["size"] = ele.size;
                    products.push(item.data)
                }

                dispatch(storeOffersAction.setStoreOffers(products));
            }
            catch (error) {
                console.log('error: ', error)
            }
        }

        fetchStoreProducts();

    }, [kioskStore])

    if (!offers || offers.length === 0) return null;


    const filtered = offers.filter((item) =>
        (item.title ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (<>
        <OverlayText />

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
                        key={(item.sku + item.size)}
                        title={item.name}
                        image_url={item.image_url}
                        description={item.description ?? ""}
                        brand={item.brand}
                        size={item.size}
                        onClick={() => dispatch(showcaseAction.setShowcase(item))}
                    />
                ))}
            </div>
        </div>
        </>
    );
};

export default OffersContainer;
