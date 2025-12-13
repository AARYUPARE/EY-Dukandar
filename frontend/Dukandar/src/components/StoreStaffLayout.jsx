import SidebarContainer from "./SidebarContainer";
import StoreStaffSidebar from "./StoreStaffSideBar";
import DashboardMain from "./DashboardMain";

const StoreStaffLayout = () => {
    return (
        <div className="container">
            <StoreStaffSidebar />
            <DashboardMain />
        </div>
    );
};

export default StoreStaffLayout;
