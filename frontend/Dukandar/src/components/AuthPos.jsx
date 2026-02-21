import AuthScanner from "./AuthScanner";
import ProductDisplay from "./ProductDisplay";
import css from "../styles/ScanningPOS.module.css";
import { showcaseAction } from "../store/store";
import { useDispatch } from "react-redux";

export default function AuthPOS() {
    
    
    
  return (
    <div className={css.layout}>
      <AuthScanner />
      <ProductDisplay />
    </div>
  );
}