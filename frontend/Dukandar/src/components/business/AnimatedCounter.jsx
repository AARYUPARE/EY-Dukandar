import { useEffect, useState } from "react";

const AnimatedCounter = ({ end, duration = 1000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    // Extract number from string if needed, or assume 'end' is a number
    const finalValue = parseInt(String(end).replace(/[^0-9]/g, ""), 10); 
    
    if (start === finalValue) return;

    let incrementTime = (duration / finalValue) * Math.abs(finalValue - start);
    // Cap speed for large numbers
    if (incrementTime < 5) incrementTime = 5; 

    let timer = setInterval(() => {
      start += Math.ceil(finalValue / (duration / 20));
      if (start >= finalValue) {
        start = finalValue;
        clearInterval(timer);
      }
      setCount(start);
    }, 20); // 20ms frame rate

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default AnimatedCounter;