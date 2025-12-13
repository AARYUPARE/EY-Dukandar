import "../styles/CollapsedSidebar.css";
import { IoHomeOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { BsTable } from "react-icons/bs";
import { TbGridDots } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import { RiExpandLeftRightFill } from "react-icons/ri";
import { sideBarAction } from "../store/store";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const CollapsedSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const handleExpand = () => {
    dispatch(sideBarAction.expand());
  };

  // same helper logic as full sidebar: exact for home, prefix for others
  const isActive = (path, exact = false) => {
    const current = location.pathname.replace(/\/+$/, "");
    const target = path.replace(/\/+$/, "");
    if (exact) return current === target;
    return current === target || current.startsWith(target + "/");
  };

  return (
    <div className="collapsed-sidebar">
      <div className="expand-button" onClick={handleExpand} title="Expand sidebar" role="button" tabIndex={0}>
        <RiExpandLeftRightFill />
      </div>

      <ul className="collapsed-nav">
        <li>
          <Link
            to="/chat"
            className={`collapsed-link ${isActive("/chat", true) ? "active" : ""}`}
            title="Home"
            aria-label="Home"
          >
            <IoHomeOutline />
          </Link>
        </li>

        <li>
          <Link
            to="/chat/profile"
            className={`collapsed-link ${isActive("/chat/profile") ? "active" : ""}`}
            title="Profile"
            aria-label="Profile"
          >
            <CgProfile />
          </Link>
        </li>

        <li>
          <Link
            to="/chat/orders"
            className={`collapsed-link ${isActive("/chat/orders") ? "active" : ""}`}
            title="Orders"
            aria-label="Orders"
          >
            <BsTable />
          </Link>
        </li>

        
      </ul>

      <div className="collapsed-footer">
        <img src="https://github.com/mdo.png" width="28" height="28" className="avatar" alt="profile" />
      </div>
    </div>
  );
};

export default CollapsedSidebar;
