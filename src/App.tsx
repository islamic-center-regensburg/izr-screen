import { useEffect, useState } from "react";
import PrayerTimes from "./components/PrayerTimes";
import EventSlider from "./components/EventSlider";
import { Image } from "@chakra-ui/react";
import Fade from "./components/Fade";
import HadithSlider from "./HadithSlider";
import Settings from "./components/Settings";

function App() {
  // const [current, setCurrent] = useState("events");
  const [current, setCurrent] = useState("prayer");

  const handleSwitch = (what: string) => {
    setCurrent(what);
  };
  useEffect(() => {
    console.log("current", current);
    if (current === "izr") {
      setTimeout(() => {
        setCurrent("hadith");
      }, 5000);
    }
  }, [current]);

  useEffect(() => {
    setTimeout(() => {
      // setCurrent("events");
    }, 5000);
  }, []);

  return (
    <>
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
      {current === "izr" && (
        <Fade>
          <Image src="https://izr-cloud.online/media/gallery_images/IZR_Flyer_Wide_1.png" />
        </Fade>
      )}
      {current === "hadith" && (
        <Fade>
          <HadithSlider onEnd={() => setCurrent("prayer")} />
        </Fade>
      )}
      {current === "settings" && <Settings GoTo={(what) => setCurrent(what)} />}
    </>
  );
}

export default App;
