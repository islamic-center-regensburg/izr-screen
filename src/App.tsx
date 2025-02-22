import { useEffect, useState } from "react";
import PrayerTimes from "./components/PrayerTimes";
import EventSlider from "./components/EventSlider";
import {  Image } from "@chakra-ui/react";
import izr from "./components/imgs/IZRBG.png";
import Fade from "./components/Fade";
import HadithSlider from "./HadithSlider";

function App() {
  const [current, setCurrent] = useState("prayer");

  const handleSwitch = (what: string) => {
    setCurrent(what);
  };
  useEffect(() => {
    console.log("current", current);
  }, [current]);

  useEffect(() => {
    setTimeout(() => {
      // setCurrent("events");
    }, 5000);
  }, []);

  return (
    <>
      {current === "izr" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Fade>
            <Image height={"100vh"} src={izr} />
          </Fade>
        </div>
      )}
      {current === "prayer" && (
        <Fade>
          <PrayerTimes GoToEvents={(what) => handleSwitch(what)} />
        </Fade>
      )}
      {current === "events" && (
        <Fade>
          <EventSlider onEnd={() => handleSwitch("hadith")} />
        </Fade>
      )}
      {current === "adhkar" && (
        <Fade>
          <EventSlider onEnd={() => handleSwitch("events")} />
        </Fade>
      )}
      {current === "hadith" && (
        <Fade>
          <HadithSlider onEnd={() => setCurrent("prayer")} />
        </Fade>
      )}
      {current === "werbung" && (
        <Image
          src="https://izr-cloud.online/getEvents/werbung.jpg"
          alt="Werbung"
          alignSelf={"center"}
          width={"100vw"}
          height={"100vh"}
        />
      )}
    </>
  );
}

export default App;
