import { useEffect, useState } from "react";
import IText from "./IText";
import DigitalClock from "./DigitalClock";

interface props {
  data: string[];
}

function TimeDateInfo({ data }: props) {
  const [today, setToday] = useState<string[]>([]);
  useEffect(() => {
    const date = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const germanDate = date.toLocaleDateString("de-DE", options as any);
    setToday([germanDate, ...data]);
  }, [data]);
  return (
    <div
      className="flex flex-row justify-between items-center w-full h-full rounded-2xl px-10"
      style={{ backgroundColor: "rgb(255,255,255,0.1)" }}
    >
      {today &&
        today.map((d, index) => (
          <IText
            style={{
              fontSize: "1.5vw",
              color: "white",
              transition: "ease 2s",
              textAlign: "left",
              fontWeight: "bold",
              direction: index === 2 ? "rtl" : "ltr",
            }}
            lang={index === 2 ? "ar" : "de"}
          >
            {d}
          </IText>
        ))}
      <div>
        <DigitalClock />
      </div>
    </div>
  );
}

export default TimeDateInfo;
