import css from "../styles/FullSidebar.module.css";
import { TbLayoutSidebarLeftCollapseFilled, TbHexagonLetterD } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { sideBarAction } from "../store/store.js";
import { Link, useLocation } from "react-router-dom";

const FullSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const handleCollapse = () => {
    dispatch(sideBarAction.collapse());
  };

  // helper: if exact=true do strict equality, otherwise check prefix (so subroutes count)
  const isActive = (path, exact = false) => {
    const current = location.pathname.replace(/\/+$/, ""); // strip trailing slash
    const target = path.replace(/\/+$/, "");
    if (exact) return current === target;
    return current === target || current.startsWith(target + "/");
  };

  return (
    <div className={css.sidebar} id={css.sidebarWrapper}>
      <div className={css.brandRow}>
        <div className={css.logoContainer}>
          <TbHexagonLetterD />
        </div>

        <div className={css.collapseIcon} onClick={handleCollapse}>
          <TbLayoutSidebarLeftCollapseFilled />
        </div>
      </div>

      <ul className={css.navList}>
        <li>
          <Link
            to=""
            className={`${css.navItem} ${isActive("", true) ? css.active : ""}`}
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            to="profile"
            className={`${css.navItem} ${isActive("profile") ? css.active : ""}`}
          >
            Profile
          </Link>
        </li>

        <li>
          <Link
            to="orders"
            className={`${css.navItem} ${isActive("orders") ? css.active : ""}`}
          >
            Orders
          </Link>
        </li>

        
      </ul>

      <div className={css.footer}>
        <img src="https://github.com/mdo.png" width="36" height="36" className={css.avatar} />
        <strong className={css.profileName}>mdo</strong>
      </div>
    </div>
  );
};

export default FullSidebar;
