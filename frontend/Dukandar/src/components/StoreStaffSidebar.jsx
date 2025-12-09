import css from "../styles/StoreStaffSidebar.module.css";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { TbHexagonLetterD } from "react-icons/tb";
import { MdPointOfSale, MdInventory, MdOutlineAddBox, MdOutlineLocalShipping } from "react-icons/md";
import { AiOutlineHome } from "react-icons/ai";
import { RiCoupon2Fill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { sideBarAction } from "../store/store";

const StoreStaffSidebar = () => {

    
    return (
        <div className={css.sidebar} id={css.sidebarWrapper}>

            {/* BRAND + COLLAPSE */}
            <div className={css.brandRow}>
                <div className={css.logoContainer}>
                    <TbHexagonLetterD />
                </div>
            </div>

            {/* NAVIGATION LIST */}
            <ul className={css.navList}>

                <li>
                    <a href="/store-staff" className={`${css.navItem} ${css.active}`}>
                        <AiOutlineHome /> Home
                    </a>
                </li>

                <li>
                    <a href="/store-staff/sales" className={css.navItem}>
                        <MdPointOfSale /> Sales
                    </a>
                </li>

                <li>
                    <a href="/store-staff/send-order" className={css.navItem}>
                        <MdOutlineLocalShipping /> Order
                    </a>
                </li>

                <li>
                    <a href="/store-staff/offers" className={css.navItem}>
                        <RiCoupon2Fill /> Offers
                    </a>
                </li>

            </ul>

            {/* FOOTER PROFILE */}
            <div className={css.footer}>
                <img
                    src="https://github.com/mdo.png"
                    width="36"
                    height="36"
                    className={css.avatar}
                />
                <strong className={css.profileName}>Store Staff</strong>
            </div>

        </div>
    );
};

export default StoreStaffSidebar;
