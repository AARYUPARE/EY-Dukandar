import css from "../styles/DashboardMain.module.css";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


export default function DashboardMain() {
  return (
    <div className={css.mainContainer}>
      <Outlet />
    </div>
  );
}
