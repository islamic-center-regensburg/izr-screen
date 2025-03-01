import { useEffect, useState } from "react";
import PrayerTimes from "./components/PrayerTimes";
import EventSlider from "./components/EventSlider";
import { Image } from "@chakra-ui/react";
import izr from "./components/imgs/IZRBG.png";
import Fade from "./components/Fade";
import HadithSlider from "./HadithSlider";
import Settings from "./components/Settings";

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
          <PrayerTimes GoTo={(what) => handleSwitch(what)} />
        </Fade>
      )}
      {current === "events" && (
        <Fade>
          <EventSlider onEnd={() => handleSwitch("hadith")} />
        </Fade>
      )}
      {current === "hadith" && (
        <Fade>
          <HadithSlider onEnd={() => setCurrent("prayer")} />
        </Fade>
      )}
      {current === "settings" && (
        <Settings GoTo={(what) => setCurrent(what)} />
      )}
    </>
  );
}

export default App;
