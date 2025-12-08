import StoreStaffDashboard from "./StoreStaffDashboard";
import InventoryTable from "./InventoryTable";
import AddStockForm from "./AddStockForm";
import SendOrder from "./SendOrder";
import SaleProduct from "./SaleProduct";
import css from "../styles/DashboardMain.module.css";

export default function DashboardMain() {
  return (
    <div className={css.mainContainer}>
      <div style={{ padding: 24 }}>
        <StoreStaffDashboard />
      </div>

      <div style={{ padding: 24 }}>
        <InventoryTable />
      </div>

      <div style={{ padding: 24 }}>
        <AddStockForm />
      </div>

      <div style={{ padding: 24 }}>
        <SendOrder />
      </div>

      <div style={{ padding: 24 }}>
        <SaleProduct />
      </div>
    </div>
  );
}
