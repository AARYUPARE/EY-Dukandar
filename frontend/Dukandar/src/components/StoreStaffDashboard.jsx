import css from "../styles/StoreStaffDashboard.module.css";
import { FaPlusCircle, FaClipboardList, FaTruckLoading, FaCashRegister } from "react-icons/fa";

const StoreStaffDashboard = () => {

    const actions = [
        { title: "Add Stock", icon: <FaPlusCircle /> },
        { title: "Check Stock", icon: <FaClipboardList /> },
        { title: "Send Order to Company", icon: <FaTruckLoading /> },
        { title: "Sale Product", icon: <FaCashRegister /> }
    ];

    return (
        <div className={css.wrapper}>
            <h1 className={css.pageTitle}>Store Staff Dashboard</h1>

            <div className={css.grid}>
                {actions.map((a, i) => (
                    <div key={i} className={css.card}>
                        <div className={css.icon}>{a.icon}</div>
                        <h3>{a.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreStaffDashboard;
