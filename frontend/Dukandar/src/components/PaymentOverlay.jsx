import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makePayment, paymentActions } from "../store/store";
import Lottie from "lottie-react";
import loaderAnimation from "../animations/loader.json";
import successAnimation from "../animations/success.json";
import "../styles/PaymentOverlay.css";

const PaymentOverlay = () => {
  const dispatch = useDispatch();
  const { wantPay,loading, status, error } = useSelector((state) => state.payment);

  const [upiId, setUpiId] = useState("");

  const handlePay = () => {
    dispatch(makePayment({ upiId }));
  };

  const onClose = () => {
    // your close logic
    dispatch(paymentActions.closePayment())
  };

  if(!wantPay) return null;

  return (
    <div className="overlay">
      <div className="payment-box">
        <h2>UPI Payment</h2>

        <input
          type="text"
          placeholder="Enter UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />

        <button onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "Pay"}
        </button>

        {/* 🔥 Animation Section (Between Pay & Close) */}

        {loading && (
          <div className="animation-small">
            <Lottie animationData={loaderAnimation} loop={true} />
          </div>
        )}

        {status === "SUCCESS" && !loading && (
          <div className="animation-small">
            <Lottie animationData={successAnimation} loop={false} />
            <p style={{ color: "green", marginTop: "5px" }}>
              Payment Successful
            </p>
          </div>
        )}

        {status === "FAILED" && (
          <p style={{ color: "red" }}>Payment Failed ❌</p>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PaymentOverlay;