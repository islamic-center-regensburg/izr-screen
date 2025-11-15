import { useEffect, useState } from "react";
import PrayerTimes from "./components/PrayerTimes";
import EventSlider from "./components/EventSlider";
import Fade from "./components/Fade";
import HadithSlider from "./HadithSlider";
import Settings from "./components/Settings";
import { FetchAndStorePrayerTimes, FetchIqamaTimes } from "./toolsfn";
import logo from "/IZRLOGOROUND.png"

function App() {
  const [current, setCurrent] = useState("prayer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLoad = async () => {
      // Load data silently
      await FetchIqamaTimes();
      await FetchAndStorePrayerTimes();
      setLoading(false);
    };

    initLoad();
  }, []);

  const handleSwitch = (what: string) => {
    setCurrent(what);
  };

  useEffect(() => {
    if (current === "izr") {
      setTimeout(() => {
        setCurrent("hadith");
      }, 5000);
    }
  }, [current]);

  if (loading) {
    return (
      <div
      className="w-screen h-screen flex flex-col items-center justify-center"
      >
        <img src={logo} className="w-xs animate-pulse"/>
        <p className="font-bold">
          Gebetszeiten werden geladen ...
        </p>
      </div>
    );
  }

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

