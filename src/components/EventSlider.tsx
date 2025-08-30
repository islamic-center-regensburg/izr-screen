/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { izr_server } from "../config";

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
  const [eventIndex, setEventIndex] = useState(0);

  const focusIntervalRef = useRef<number | null>(null);
  const eventIntervalRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  // fetch events once
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

  // start timers once events are loaded
  useEffect(() => {
    if (!events.length || finishedRef.current) return;

    // rotate focus every 5s
    const rotateFocus = () => {
      setFocusLang((prev) => {
        const i = LANGS.indexOf(prev);
        return LANGS[(i + 1) % LANGS.length];
      });
    };
    focusIntervalRef.current = window.setInterval(rotateFocus, 5000);

    // advance event every 15s
    const advanceEvent = () => {
      setEventIndex((idx) => {
        const isLast = idx >= events.length - 1;
        if (isLast) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            if (focusIntervalRef.current)
              window.clearInterval(focusIntervalRef.current);
            if (eventIntervalRef.current)
              window.clearInterval(eventIntervalRef.current);
            onEnd?.();
          }
          return idx; // stay on last
        }
        return idx + 1;
      });
    };
    eventIntervalRef.current = window.setInterval(advanceEvent, 15000);

    return () => {
      if (focusIntervalRef.current)
        window.clearInterval(focusIntervalRef.current);
      if (eventIntervalRef.current)
        window.clearInterval(eventIntervalRef.current);
    };
  }, [events, onEnd]);

  // when event changes, reset focus to de (so each event starts with de)
  useEffect(() => {
    setFocusLang("de");
  }, [eventIndex]);

  const widthFor = (lang: Lang) => (lang === focusLang ? "50%" : "25%");

  if (!events.length) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading events…</p>
      </div>
    );
  }

  const current = events[Math.min(eventIndex, events.length - 1)];

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center gap-5">
      <div className="flex h-full w-full justify-center items-center gap-5 p-10">
        {/* DE */}
        <div
          className="relative max-h-screen transition-all duration-700 ease-in-out flex-none mx-auto"
          style={{ width: widthFor("de") }}
        >
          <img
            className="max-h-screen w-auto object-cover rounded-2xl shadow-lg"
            src={current.de}
            alt={`Event ${eventIndex + 1} (DE)`}
          />
        </div>

        {/* EN */}
        <div
          className="relative max-h-screen transition-all duration-700 ease-in-out flex-none mx-auto"
          style={{ width: widthFor("en") }}
        >
          <img
            className="max-h-screen w-auto object-cover rounded-2xl shadow-lg"
            src={current.en}
            alt={`Event ${eventIndex + 1} (EN)`}
          />
        </div>

        {/* AR */}
        <div
          className="relative max-h-screen transition-all duration-700 ease-in-out flex-none mx-auto"
          style={{ width: widthFor("ar") }}
        >
          <img
            className="max-h-screen w-auto object-cover rounded-2xl shadow-lg"
            src={current.ar}
            alt={`Event ${eventIndex + 1} (AR)`}
          />
        </div>
      </div>
    </div>
  );
}

export default EventSlider;
