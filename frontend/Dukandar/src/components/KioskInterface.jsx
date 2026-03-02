import SidebarContainer from "./SidebarContainer";
import ChatContainer from "./ChatContainer";
// import CardContainer from "./CardContainer";
import OffersContainer from "./OfferContainer";
import Navbar from "./Navbar";

import css from "../styles/KioskInterface.module.css";
import { Outlet, useLocation } from "react-router-dom";
import PaymentOverlay from "./PaymentOverlay";
import { useEffect } from "react";
import { connectWS } from "../../web_socket/socketListener";
import { backendEventHandler } from "../store/store";
import axios from "axios";


const KioskInterface = () => {

    useEffect(() => {
        connectWS(backendEventHandler)
    })

    const location = useLocation();

    const isScanningPage = location.pathname.includes("scanning-pos") || location.pathname.includes("reserve-auth");

    return (
        <div className={css.wrapper}>
            <PaymentOverlay />
            {/* LEFT SIDE - Cards */}
            {!isScanningPage && (
                <div className={css.left}>
                    <OffersContainer />
                </div>
            )}

            {/* RIGHT SIDE - Chat */}
            {!isScanningPage ? <div className={`${css["right"]}`}>
                <Outlet />
            </div> : <Outlet />}
        </div>
    );
};

export default KioskInterface;
