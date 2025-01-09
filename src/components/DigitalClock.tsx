import { useState, useEffect } from "react";
import IText from "./IText";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID); // Cleanup the interval on component unmount
  }, []);

  const tick = () => {
    setTime(new Date());
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      style={{
        // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
        borderRadius: "1rem",
        width: "100%",
        height: "100%",
        // background: colors.grad,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
      }}
    >
      <IText
        style={{
          color: "white",
          fontSize: "2.5vw",
          textAlign: "center",
          fontWeight: "bold",
          height: "100%",
          padding: 5,
          paddingBottom: 0,
        }}
      >
        {formatTime(time)}
      </IText>
    </div>
  );
};

export default DigitalClock;
