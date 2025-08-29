/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { izr_server } from "../config";
import "react-slideshow-image/dist/styles.css";
import Slide from "./Slide";

interface Props {
  onEnd: () => void;
}

interface Event {
  de: string;
  en: string;
  ar: string;
}

const LANGS = ["de", "en", "ar"] as const;
type Lang = (typeof LANGS)[number];

function EventSlider({ onEnd }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [focusLang, setFocusLang] = useState<Lang>("de");
  const focusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get<{
          events: { flyer: string; flyer_ar: string; flyer_en: string }[];
        }>(izr_server + "/getEvents/all");
        const eventUrls: Event[] = response.data.events.map((event) => ({
          de: event.flyer,
          en: event.flyer_en,
          ar: event.flyer_ar,
        }));
        setEvents(eventUrls);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Rotate focus among de -> en -> ar
  useEffect(() => {
    const rotate = () => {
      setFocusLang((prev) => {
        if (prev === "ar") return "ar";
        const i = LANGS.indexOf(prev);
        return LANGS[(i + 1) % LANGS.length];
      });
    };
    focusTimerRef.current = window.setInterval(rotate, 5000); // every 3s
    return () => {
      if (focusTimerRef.current) window.clearInterval(focusTimerRef.current);
    };
  }, []);

  // Helper to compute width % per panel based on current focus
  const widthFor = (lang: Lang) => (lang === focusLang ? "50%" : "25%");

  // (Optional) when slide changes, reset focus to 'de'
  const handleSlideChange = () => setFocusLang("de");

  return (
    // @ts-expect-error
    <Slide interval={15000} onEnd={onEnd} onChange={handleSlideChange}>
      {events.map((event, index) => (
        <div
          key={index}
          className="w-screen h-screen bg-white flex items-center justify-center gap-5"
        >
          <div className="flex h-full w-full justify-center items-center gap-5 p-10">
            {/* DE */}
            <div
              className="relative max-h-screen transition-all duration-700 ease-in-out flex-none mx-auto"
              style={{ width: widthFor("de") }}
            >
              <img
                className="max-h-screen w-auto object-cover rounded-2xl shadow-lg"
                src={event.de}
                alt={`Event ${index + 1} (DE)`}
              />
            </div>

            {/* EN */}
            <div
              className="relative max-h-screen transition-all duration-700 ease-in-out flex-none mx-auto"
              style={{ width: widthFor("en") }}
            >
              <img
                className="max-h-screen w-auto object-cover rounded-2xl shadow-lg"
                src={event.en}
                alt={`Event ${index + 1} (EN)`}
              />
            </div>

            {/* AR */}
            <div
              className="relative max-h-screen border-2 border-e-red-400 transition-all duration-700 ease-in-out flex-none mx-auto"
              style={{ width: widthFor("ar") }}
            >
              <img
                className="max-h-screen w-auto object-cover rounded-2xl shadow-lg"
                src={event.ar}
                alt={`Event ${index + 1} (AR)`}
              />
            </div>
          </div>
        </div>
      ))}
    </Slide>
  );
}

export default EventSlider;
