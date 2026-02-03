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
import { sideBarAction, productsAction } from "../store/store.js";
import { Link, useLocation } from "react-router-dom";

const FullSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(store => store.user)

  const handleCollapse = () => {
    dispatch(sideBarAction.collapse());
  };

  const showProducts = () => 
  {
    dispatch(productsAction.setCanShow(true))
  }
  
  const hideProducts = () => 
  {
    dispatch(productsAction.setCanShow(false))
  }

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
            onClick={showProducts}
          >
            <TbHome2 className={css.navIcon} />
            Home
          </Link>
        </li>

        <li>
          <Link
            to="profile"
            className={`${css.navItem} ${isActive("profile") ? css.active : ""}`}
            onClick={hideProducts}
          >
            <TbUserCircle className={css.navIcon} />
            Profile
          </Link>
        </li>

        <li>
          <Link
            to="orders"
            className={`${css.navItem} ${isActive("orders") ? css.active : ""}`}
            onClick={hideProducts}
          >
            <TbReceipt2 className={css.navIcon} />
            Orders
          </Link>
        </li>

        <li>
          <Link
            to="cart"
            className={`${css.navItem} ${isActive("cart") ? css.active : ""}`}
            onClick={hideProducts}
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
