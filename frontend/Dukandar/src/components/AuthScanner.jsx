import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import css from "../styles/AuthScanner.module.css";
import axios from "axios";
import { BASE_BACKEND_URL } from "../store/store";
import { useDispatch } from "react-redux";
import { chatAction } from "../store/store";
import { useNavigate } from "react-router-dom";

export default function AuthScanner() {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("Scan user QR to login");

  const onAuth = async (reservation) => {

    try {
        
        let res = await axios.get(BASE_BACKEND_URL + "/reservations/auth", 
            {
                params: {...reservation}
            }
        )
        
        if(res.data.status == "SUCCESS")
        {
          setMessage(`Reservation authenticated ✅`);

          dispatch(
                chatAction.addMessage({
                  id: Date.now().toString(),
                  sender: "bot",
                  text: res.data.reply,
                  isLoading: false,
                  inputState : "text",
                  lang: "en"
                }))

          navigate("../chat")
        }
        else 
          setMessage("Invalid QR ❌");
            
    } catch (error) {
        console.log("Auth Failed: " + error)
    }

  }

  useEffect(() => {
    readerRef.current = new BrowserQRCodeReader();

    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setMessage("Scanning...");

    controlsRef.current = await readerRef.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result) {
          handleQR(result.getText());
        }
      }
    );
  };

  const stopScanning = () => {
    controlsRef.current?.stop();
    setScanning(false);
  };

  const handleQR = (text) => {
    stopScanning(); // ✅ prevent multiple scans

    try {

        console.log(text)
      const [productId, storeId, size, userId] = text.split("_");

      // send userId back to parent

        let reservation = {
            productId: productId,
            storeId: storeId,
            size: size,
            userId: userId,
        }

      onAuth(reservation);
    } catch(e) {
      setMessage("Invalid QR ❌: " + e);
    }
  };

  return (
    <div className={css.wrapper}>
      <h2>User QR Login</h2>

      <video ref={videoRef} className={css.video} />

      <p className={css.message}>{message}</p>

      {!scanning ? (
        <button className={css.startBtn} onClick={startScanning}>
          Start Scan
        </button>
      ) : (
        <button className={css.stopBtn} onClick={stopScanning}>
          Stop
        </button>
      )}
    </div>
  );
}
