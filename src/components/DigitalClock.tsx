import { useEffect, useState, useRef } from "react";
import IText from "./IText";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const scheduleNextUpdate = () => {
      const now = new Date();
      const msUntilNextMinute = (60 - now.getSeconds()) * 1000;

      // Update once right now to avoid lag
      setTime(now);

      // After reaching the next full minute, update every 60s
      timeoutRef.current = setTimeout(() => {
        setTime(new Date());
        intervalRef.current = setInterval(() => setTime(new Date()), 60 * 1000);
      }, msUntilNextMinute);
    };

    scheduleNextUpdate();

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div
      style={{
        borderRadius: "1rem",
        width: "100%",
        height: "100%",
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
