import Navbar from "./Navbar";
import StoreStaffDashboard from "./StoreStaffDashboard";
import css from "../styles/DashboardMain.module.css";

const DashboardMain = () => {
    return (
        <div className={css.mainContainer}>
            <Navbar />
            <StoreStaffDashboard />
        </div>
    );
};

export default DashboardMain;
