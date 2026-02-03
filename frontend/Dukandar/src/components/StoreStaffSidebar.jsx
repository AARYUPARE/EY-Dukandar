import css from "../styles/StoreStaffSidebar.module.css";
import { TbHexagonLetterD } from "react-icons/tb";
import { MdPointOfSale, MdOutlineLocalShipping } from "react-icons/md";
import { AiOutlineHome } from "react-icons/ai";
import { RiCoupon2Fill } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";

const StoreStaffSidebar = () => {

    const location = useLocation();
    const path = location.pathname;

    // helper to check active route
    const isActive = (route) => path.includes(route);

    return (
        <div className={css.sidebar} id={css.sidebarWrapper}>

            <div className={css.brandRow}>
              <div className={css.logoContainer}>
                <TbHexagonLetterD />
              </div>
            
              {/* BRAND NAME */}
              <div className={css.brandName}>
                Dukandar
              </div>
            </div>

            {/* NAVIGATION LIST */}
            <ul className={css.navList}>

                <li>
                    <Link
                        to="/store-staff"
                        className={`${css.navItem} ${path === "/store-staff" ? css.active : ""}`}
                    >
                        <AiOutlineHome /> Home
                    </Link>
                </li>

                <li>
                    <Link
                        to="/store-staff/sales"
                        className={`${css.navItem} ${isActive("sales") ? css.active : ""}`}
                    >
                        <MdPointOfSale /> Sales
                    </Link>
                </li>

                <li>
                    <Link
                        to="/store-staff/offers"
                        className={`${css.navItem} ${isActive("offers") ? css.active : ""}`}
                    >
                        <RiCoupon2Fill /> Offers
                    </Link>
                </li>

            </ul>

            {/* FOOTER */}
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