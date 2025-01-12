import { HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import IText from "./IText";
import DigitalClock from "./DigitalClock";
import { colors } from "../config";

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
    <HStack
      justifyContent={"space-around"}
      alignItems={"center"}
      // height={"100%"}
      style={{
        background: colors.grad,
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
        borderRadius: "1rem",
      }}
      
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
          >
            {d}
          </IText>
        ))}
      <div style={{ padding: 5, width: "30%" }}>
        <DigitalClock />
      </div>
    </HStack>
  );
}

export default TimeDateInfo;
