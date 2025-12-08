import css from "../styles/StoreStaffDashboard.module.css";
import { FaPlusCircle, FaClipboardList, FaTruckLoading, FaCashRegister } from "react-icons/fa";

const StoreStaffDashboard = ({ onAction }) => {
  const actions = [
    { id: "add-stock", title: "Add Stock", icon: <FaPlusCircle /> },
    { id: "check-stock", title: "Check Stock", icon: <FaClipboardList /> },
    { id: "send-order", title: "Send Order to Company", icon: <FaTruckLoading /> },
    { id: "sale-product", title: "Sale Product", icon: <FaCashRegister /> }
  ];

  return (
    <div className={css.wrapper}>
      <h1 className={css.pageTitle}>Store Staff Dashboard</h1>

      <div className={css.grid}>
        {actions.map((a) => (
          <div key={a.id} className={css.card} role="button" tabIndex={0}
               onClick={() => onAction?.(a.id)}
               onKeyDown={(e) => e.key === "Enter" && onAction?.(a.id)}>
            <div className={css.icon}>{a.icon}</div>
            <h3>{a.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreStaffDashboard;
