/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useState } from "react";
import { colors } from "../config";
import { HStack, VStack } from "@chakra-ui/react";
import IText from "./IText";

interface props {
  prayer_de: string;
  prayer_ar: string;
  time: string;
  next: string;
  iqama: number;
  GetNextPrayerTimes: () => void;
  reloadPrayerTimes: () => void;
  GoToEvents: (what: string) => void;
}

const Prayer = ({
  prayer_de,
  prayer_ar,
  time,
  next,
  iqama,
  GetNextPrayerTimes,
  reloadPrayerTimes,
  GoToEvents,
}: props) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [timeToCount, setTimesToCount] = useState(new Date());
  const [eventsCounter, setEventsCounter] = useState(500);
  const [currentState, setCurrentState] = useState("countdown");
  const [diff, setDiff] = useState(0);

  const containerStyle = {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: highlight ? colors.primary : colors.sec,
    background: highlight ? colors.grad : colors.grad_sec,
    borderRadius: "1rem",
    // border: "2px solid lightgrey",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
    transition: "ease 2s",
    padding: "1rem",
  };
  const prayerData = highlight
    ? [prayer_de, time, prayer_ar, remainingTime]
    : [prayer_de, time, prayer_ar];

  function scheduleForNextDay(hour = 0, minute = 5) {
    // Get the current date and time
    const now = new Date();

    // Create a date object for the next day's 00:05
    const nextDay = new Date(now);
    nextDay.setDate(now.getDate() + 1);
    nextDay.setHours(hour);
    nextDay.setMinutes(minute);
    nextDay.setSeconds(0);
    nextDay.setMilliseconds(0);
    const timeUntilNextDay = nextDay.getTime() - now.getTime();
    console.log(
      "this function is triggered and the time until next day is " +
        timeUntilNextDay / 60 / 60 / 1000 +
        " hours  and minutes : " +
        timeUntilNextDay / 60 / 100
    );
    setTimeout(() => {
      reloadPrayerTimes();
    }, timeUntilNextDay);
  }
  useEffect(() => {
    scheduleForNextDay();
  }, []);
  useEffect(() => {
    if (
      eventsCounter === 1000 * 5 * 60 &&
      currentState === "countdown" &&
      diff >= 5 * 60 * 1000
    ) {
      GoToEvents("events");
    }
  }, [eventsCounter]);
  function calculateRemainingTime() {
    const now = new Date();

    const difference = timeToCount.getTime() - now.getTime();
    setDiff(difference);
    if (difference <= 1000) {
      console.log("tirggr ed");
      if (currentState === "countdown") {
        setCurrentState("adhan");
        setTimesToCount(new Date(timeToCount.getTime() + 30 * 1000));
      }
      if (currentState === "adhan") {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        iqama &&
          setTimesToCount(new Date(timeToCount.getTime() + iqama * 60 * 1000));
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !iqama &&
          setTimesToCount(new Date(timeToCount.getTime() + 10 * 60 * 1000));
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        iqama && setCurrentState("IqamaCountdown");
        !iqama && setCurrentState("prayer");
      }
      if (currentState === "IqamaCountdown") {
        setTimesToCount(new Date(timeToCount.getTime() + 30 * 1000));
        setCurrentState("iqama");
      }
      if (currentState === "iqama") {
        setTimesToCount(new Date(timeToCount.getTime() + 10 * 60 * 1000));
        setCurrentState("prayer");
      }
      if (currentState === "prayer") {
        prayer_de !== "Jumaa" && GoToEvents("adhkar");
        prayer_de === "Jumaa" && GetNextPrayerTimes();
      }
    }

    return difference > 0 ? Math.floor(difference / 1000) : 0;
  }
  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${String(hours).padStart(2, "0")}:`;
    }
    if (hours > 0 || minutes > 0) {
      formattedTime += `${String(minutes).padStart(2, "0")}:`;
    }
    formattedTime += `${String(remainingSeconds).padStart(2, "0")}`;

    return formattedTime;
  }
  useEffect(() => {
    console.log("Current State: " + currentState);
  }, [currentState]);

  useEffect(() => {
    if (!highlight) return;
    const prayerTime = new Date();
    const [hours, minutes] = String(time).split(":");
    prayerTime.setHours(parseInt(hours, 10));
    prayerTime.setMinutes(parseInt(minutes, 10));
    prayerTime.setSeconds(0);
    setTimesToCount(prayerTime);
  }, [highlight]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (highlight) {
        setEventsCounter((current) => current + 500);
        calculateRemainingTime() &&
          setRemainingTime(formatTime(calculateRemainingTime()));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [timeToCount, next]);

  useEffect(() => {
    highlight &&
      console.log("Time to count :", timeToCount.toTimeString(), prayer_de);
  }, [timeToCount]);

  useEffect(() => {
    console.log("chagiging highlight from :", highlight);
    setHighlight(next === prayer_de);
    console.log("chagiging highlight to :", next === prayer_de);
  }, [next]);
  useEffect(() => {
    setHighlight(next === prayer_de);
  }, []);

  if (currentState === "adhan") {
    return (
      <div style={containerStyle}>
        <VStack>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
              textAlign: "center",
            }}
          >
            آذان صلاة {prayer_ar}
          </IText>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
              textAlign: "center",
            }}
          >
            {prayer_de} Adhan
          </IText>
        </VStack>
      </div>
    );
  }
  if (currentState === "IqamaCountdown") {
    return (
      <div style={containerStyle}>
        <VStack>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
              textAlign: "center",
            }}
          >
            الإقامة بعد
          </IText>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
            }}
          >
            {highlight && remainingTime}
          </IText>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
              textAlign: "center",
            }}
          >
            Iqamah in
          </IText>
        </VStack>
      </div>
    );
  }
  if (currentState === "iqama") {
    return (
      <div style={containerStyle}>
        {" "}
        <VStack>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
              textAlign: "center",
            }}
          >
            إقامة صلاة {prayer_ar}
          </IText>
          <IText
            style={{
              fontSize: "4vw",
              fontWeight: "bold",
              color: highlight ? "white" : "#132a13",
              transition: "ease 2s",
              textAlign: "center",
            }}
          >
            {prayer_de} Iqamah
          </IText>
        </VStack>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <VStack width={"100%"}>
        {prayerData.map((data, index) =>
          index !== 3 ? (
            <IText
              style={{
                fontSize: "4vw",
                fontWeight: "bold",
                color: highlight ? "white" : "#132a13",
                transition: "ease 2s",
              }}
            >
              {data}
            </IText>
          ) : (
            currentState !== "prayer" && (
              <IText
                style={{
                  fontSize: "4vw",
                  fontWeight: "bold",
                  color: highlight ? "white" : "#132a13",
                  transition: "ease 2s",
                }}
              >
                {data}
              </IText>
            )
          )
        )}
        <HStack justifyContent={"space-between"} width={"100%"}>
          {iqama !== 0 && (
            <IText
              style={{
                fontSize: "1vw",
                fontWeight: "bold",
                color: highlight ? "white" : "#132a13",
                transition: "ease 2s",
                direction: "ltr",
              }}
            >
              Iqama {iqama} min nach Adhan
            </IText>
          )}
          {iqama !== 0 && iqama >= 10 && (
            <IText
              style={{
                fontSize: "1vw",
                fontWeight: "bold",
                color: highlight ? "white" : "#132a13",
                transition: "ease 2s",
                direction: "rtl",
              }}
            >
              الإقامة {iqama} دقيقة بعد الأذان
            </IText>
          )}
          {iqama !== 0 && iqama <= 10 && (
            <IText
              style={{
                fontSize: "1vw",
                fontWeight: "bold",
                color: highlight ? "white" : "#132a13",
                transition: "ease 2s",
                direction: "rtl",
              }}
            >
              الإقامة {iqama} دقائق بعد الأذان
            </IText>
          )}
        </HStack>
      </VStack>
    </div>
  );
};

export default Prayer;
