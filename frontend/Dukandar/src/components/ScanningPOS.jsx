import Scanner from "./Scanner";
import Cart from "./Cart";
import css from "../styles/ScanningPOS.module.css";

export default function ScanningPOS() {
  return (
    <div className={css.layout}>
      <Scanner />
      <Cart />
    </div>
  );
}
