import css from "../styles/FullSidebar.module.css";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbHexagonLetterD,
  TbHome2,
  TbUserCircle,
  TbReceipt2,
  TbShoppingCart
} from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { sideBarAction } from "../store/store.js";
import { Link, useLocation } from "react-router-dom";

const FullSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(store => store.user)

  const handleCollapse = () => {
    dispatch(sideBarAction.collapse());
  };

  const isActive = (path, exact = false) => {
    const current = location.pathname.replace(/\/+$/, "");
    const target = path.replace(/\/+$/, "");
    if (exact) return current === target;
    return current === target || current.startsWith(target + "/");
  };

  return (
    <div className={css.sidebar} id={css.sidebarWrapper}>
      {/* Brand */}
<div className={css.brandRow}>
  <div className={css.logoContainer}>
    <TbHexagonLetterD />
  </div>

  {/* BRAND NAME */}
  <div className={css.brandName}>
    Dukandar
  </div>

  <div className={css.collapseIcon} onClick={handleCollapse}>
    <TbLayoutSidebarLeftCollapseFilled />
  </div>
</div>


      {/* Navigation */}
      <ul className={css.navList}>
        <li>
          <Link
            to=""
            className={`${css.navItem} ${isActive("", true) ? css.active : ""}`}
          >
            <TbHome2 className={css.navIcon} />
            Home
          </Link>
        </li>

        <li>
          <Link
            to="profile"
            className={`${css.navItem} ${isActive("profile") ? css.active : ""}`}
          >
            <TbUserCircle className={css.navIcon} />
            Profile
          </Link>
        </li>

        <li>
          <Link
            to="orders"
            className={`${css.navItem} ${isActive("orders") ? css.active : ""}`}
          >
            <TbReceipt2 className={css.navIcon} />
            Orders
          </Link>
        </li>

        <li>
          <Link
            to="cart"
            className={`${css.navItem} ${isActive("cart") ? css.active : ""}`}
          >
            <TbShoppingCart className={css.navIcon} />
            Cart
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className={css.footer}>
        <img
          src={`${user.imageUrl}`}
          width="36"
          height="36"
          className={css.avatar}
        />
        <strong className={css.profileName}>{user.name}</strong>
      </div>
    </div>
  );
};

export default FullSidebar;
