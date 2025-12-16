import SidebarContainer from "./SidebarContainer";
import ChatContainer from "./ChatContainer";
// import CardContainer from "./CardContainer";
import OffersContainer from "./OfferContainer";
import Navbar from "./Navbar";

import css from "../styles/KioskInterface.module.css";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const KioskInterface = () => {

    

    return (
        <div className={css.wrapper}>
            {/* LEFT SIDE - Cards */}
            <div className={css.left}>
                <Navbar />
                <OffersContainer />
            </div>

            {/* RIGHT SIDE - Chat */}
            <div className={css.right}>
                <Outlet />
            </div>
        </div>
    );
};

export default KioskInterface;
