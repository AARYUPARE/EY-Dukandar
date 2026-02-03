import css from "../styles/StoreStaffDashboard.module.css";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaClipboardList,
  FaTruckLoading,
  FaCashRegister
} from "react-icons/fa";

const StoreStaffDashboard = () => {
  const actions = [
    { id: "add-stock", title: "Add Stock", icon: <FaPlusCircle /> },
    { id: "check-stock", title: "Check Stock", icon: <FaClipboardList /> },
    { id: "send-order", title: "Send Order to Company", icon: <FaTruckLoading /> },
    { id: "sale-product", title: "Sale Product", icon: <FaCashRegister /> }
  ];

  const navigate = useNavigate();

  return (
    <div className={css.wrapper}>
      
      {/* ✅ WHITE DASHBOARD CONTAINER */}
      <div className={css.contentBox}>
        <h1 className={css.pageTitle}>Store Staff Dashboard</h1>

        <div className={css.grid}>
          {actions.map((a) => (
            <div
              key={a.id}
              className={css.card}
              role="button"
              tabIndex={0}
              onClick={() => navigate(a.id)}
              onKeyDown={(e) => e.key === "Enter" && navigate(a.id)}
            >
              <div className={css.icon}>{a.icon}</div>
              <h3>{a.title}</h3>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default StoreStaffDashboard;