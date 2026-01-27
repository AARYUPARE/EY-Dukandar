import "../styles/CollapsedSidebar.css";
import {
  TbHome2,
  TbUserCircle,
  TbReceipt2,
  TbShoppingCart,
  TbLayoutSidebarRightExpand
} from "react-icons/tb";
import { sideBarAction } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const CollapsedSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(store => store.user)

  const handleExpand = () => {
    dispatch(sideBarAction.expand());
  };

  const isActive = (path, exact = false) => {
    const current = location.pathname.replace(/\/+$/, "");
    const target = path.replace(/\/+$/, "");
    if (exact) return current === target;
    return current === target || current.startsWith(target + "/");
  };

  return (
    <div className="collapsed-sidebar">
      {/* Expand Button */}
      <div
        className="expand-button"
        onClick={handleExpand}
        title="Expand sidebar"
        role="button"
        tabIndex={0}
      >
        <TbLayoutSidebarRightExpand />
      </div>

      {/* Navigation */}
      <ul className="collapsed-nav">
        <li>
          <Link
            to="/chat"
            className={`collapsed-link ${isActive("/chat", true) ? "active" : ""}`}
            title="Home"
            aria-label="Home"
          >
            <TbHome2 />
          </Link>
        </li>

        <li>
          <Link
            to="/chat/profile"
            className={`collapsed-link ${isActive("/chat/profile") ? "active" : ""}`}
            title="Profile"
            aria-label="Profile"
          >
            <TbUserCircle />
          </Link>
        </li>

        <li>
          <Link
            to="/chat/orders"
            className={`collapsed-link ${isActive("/chat/orders") ? "active" : ""}`}
            title="Orders"
            aria-label="Orders"
          >
            <TbReceipt2 />
          </Link>
        </li>

        <li>
          <Link
            to="/chat/cart"
            className={`collapsed-link ${isActive("/chat/cart") ? "active" : ""}`}
            title="Cart"
            aria-label="Cart"
          >
            <TbShoppingCart />
          </Link>
        </li>
      </ul>

      {/* Footer */}
      <div className="collapsed-footer">
        <img
          src={`${user.imageUrl}`}
          width="28"
          height="28"
          className="avatar"
          alt="profile"
        />
      </div>
    </div>
  );
};

export default CollapsedSidebar;
