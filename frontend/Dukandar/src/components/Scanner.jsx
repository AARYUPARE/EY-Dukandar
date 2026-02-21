import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useDispatch } from "react-redux";
import { cartActions } from "../store/store";
import css from "../styles/Scanner.module.css";

export default function Scanner() {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);

  const dispatch = useDispatch();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => {
      // ✅ correct cleanup
      controlsRef.current?.stop();
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);

    controlsRef.current = await readerRef.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, err) => {
        if (result) {
          const barcode = result.getText();
          handleBarcode(barcode);
        }
      }
    );
  };

  const stopScanning = () => {
    controlsRef.current?.stop(); // ✅ correct stop
    setScanning(false);
  };

  const handleBarcode = (barcode) => {
    const [sku, storeId, size] = barcode.split("_");

    dispatch(
      cartActions.addItem({
        sku,
        title: sku,
        price: 50,
        size
      })
    );
  };

  return (
    <div className={css.wrapper}>
      <h2>Scanner</h2>

      <video ref={videoRef} className={css.video} />

      {!scanning ? (
        <button onClick={startScanning}>Start Scanning</button>
      ) : (
        <button onClick={stopScanning}>Stop</button>
      )}
    </div>
  );
}
