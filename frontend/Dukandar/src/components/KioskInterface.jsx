import SidebarContainer from "./SidebarContainer";
import ChatContainer from "./ChatContainer";
import CardContainer from "./CardContainer";
import Navbar from "./Navbar";

import css from "../styles/KioskInterface.module.css";

const KioskInterface = () => {
    return (
        <div className={css.wrapper}>
            {/* LEFT SIDE - Cards */}
            <div className={css.left}>
                <Navbar />
                <CardContainer />
            </div>

            {/* RIGHT SIDE - Chat */}
            <div className={css.right}>
                <ChatContainer />
            </div>
        </div>
    );
};

export default KioskInterface;
