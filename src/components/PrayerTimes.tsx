import { useEffect, useState, useMemo, useCallback } from "react";
import Prayer from "./Prayer";
import {
  DayPrayerTimes,
  FetchCurrentDayPrayerTimes,
  GetIqamaTimes,
  getNextPrayerTime,
} from "../toolsfn";
import { IZR } from "./IZR";
import TimeDateInfo from "./TimeDateInfo";

import shiny from "/Wave.svg";

interface Props {
  GoTo: (what: string) => void;
}

const PrayerTimes = ({ GoTo }: Props) => {
  const [todayPrayerTimes, setTodayPrayerTimes] =
    useState<DayPrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [prayersLayout, setPrayersLayout] = useState("1fr 1fr 1fr 1fr 1fr 1fr");

  const [iqamaTimes, setIqamaTimes] = useState({
    asr: 15,
    dhuhr: 15,
    fajr: 15,
    isha: 0,
    jumaa: 0,
    maghrib: 5,
    tarawih: 0,
    shuruq: 0,
  });

  // ============ Daten laden ============
  const handleGetNextPrayerTimes = useCallback(
    (ptimes: DayPrayerTimes) => {
      const next = getNextPrayerTime(ptimes);
      setNextPrayer(next.prayer);

      const layoutMap: Record<string, string> = {
        Fajr: "1.5fr 1fr 1fr 1fr 1fr 1fr",
        Shuruq: "1fr 1.5fr 1fr 1fr 1fr 1fr",
        Dhuhr: "1fr 1fr 1.5fr 1fr 1fr 1fr",
        Jumaa: "1fr 1fr 1.5fr 1fr 1fr 1fr",
        Asr: "1fr 1fr 1fr 1.5fr 1fr 1fr",
        Maghrib: "1fr 1fr 1fr 1fr 1.5fr 1fr",
        Isha: "1fr 1fr 1fr 1fr 1fr 1.5fr",
      };
      setPrayersLayout(layoutMap[next.prayer] ?? "1fr 1fr 1fr 1fr 1fr 1fr");

      if (next.prayer === "none") {
        setTimeout(() => GoTo("events"), 2 * 60 * 1000);
      }
    },
    [GoTo]
  );

  const fetchTodayPrayerTimes = useCallback(async () => {
    const ptimes = (await FetchCurrentDayPrayerTimes()) as DayPrayerTimes;
    setTodayPrayerTimes(ptimes);
    handleGetNextPrayerTimes(ptimes);
    setIqamaTimes(GetIqamaTimes());
  }, [handleGetNextPrayerTimes]);

  useEffect(() => {
    fetchTodayPrayerTimes();
  }, [fetchTodayPrayerTimes]);

  // Reload um Mitternacht
  useEffect(() => {
    const id = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 5) {
        await fetchTodayPrayerTimes();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchTodayPrayerTimes]);

  // ========= Hilfsfunktionen ==========
  const getComments = useCallback(
    (prayer: string, iqama: number): [string, string] => {
      if (prayer === "Shuruq") return ["", ""];
      if (iqama === 0) return ["الإقامة بعد الأذان", "Iqama direkt nach Adhan"];
      const ar = `الإقامة ${iqama} دقيقة بعد الأذان`;
      const de = `Iqama ${iqama} min nach Adhan`;
      return [ar, de];
    },
    []
  );

  // ========= Memoisierte Daten ==========
  const prayers = useMemo(() => {
    if (!todayPrayerTimes) return [];
    const base = [
      {
        de: "Fajr",
        ar: "الفجر",
        time: todayPrayerTimes.Fajr,
        key: "Fajr",
        iqama: iqamaTimes.fajr,
      },
      {
        de: "Shuruq",
        ar: "شروق",
        time: todayPrayerTimes.Shuruq,
        key: "Shuruq",
        iqama: iqamaTimes.shuruq,
      },
      {
        de: "Asr",
        ar: "العصر",
        time: todayPrayerTimes.Asr,
        key: "Asr",
        iqama: iqamaTimes.asr,
      },
      {
        de: "Maghrib",
        ar: "المغرب",
        time: todayPrayerTimes.Maghrib,
        key: "Maghrib",
        iqama: iqamaTimes.maghrib,
      },
      {
        de: "Isha",
        ar: "العشاء",
        time: todayPrayerTimes.Isha,
        key: "Isha",
        iqama: iqamaTimes.isha,
      },
    ];
    const dhuhrOrJumaa =
      new Date().getDay() === 5
        ? {
            de: "Jumaa",
            ar: "الجمعة",
            time: todayPrayerTimes.Jumaa,
            key: "Dhuhr",
            iqama: iqamaTimes.jumaa,
          }
        : {
            de: "Dhuhr",
            ar: "الظهر",
            time: todayPrayerTimes.Dhuhr,
            key: "Dhuhr",
            iqama: iqamaTimes.dhuhr,
          };

    return [...base, dhuhrOrJumaa];
  }, [todayPrayerTimes, iqamaTimes]);

  const orderedPrayers = useMemo(() => {
    const order = ["Fajr", "Shuruq", "Dhuhr", "Asr", "Maghrib", "Isha"];
    return order
      .map((k) => prayers.find((p) => p.key === k))
      .filter(Boolean) as typeof prayers;
  }, [prayers]);

  // ========= Render ==========
  return (
    <div
      style={{ backgroundImage: `url(${shiny})` }}
      className="h-screen w-screen flex items-center justify-center p-2 box-border bg-cover"
    >
      <div
        className="
          grid gap-[10px] h-full w-full rounded-2xl
          grid-rows-[8fr_1fr_1fr]
          transition-[grid-template-columns] duration-1000 ease-in-out
        "
        style={{ gridTemplateColumns: prayersLayout }}
      >
        {/* Row 1: prayers */}
        {orderedPrayers.map((p) => (
          <div key={p.key} className="transition-all duration-1000 ease-in-out">
            <Prayer
              reloadPrayerTimes={fetchTodayPrayerTimes}
              prayer_ar={p.ar}
              prayer_de={p.de}
              time={p.time!}
              next={nextPrayer!}
              iqama={p.iqama}
              comments={getComments(p.de, p.iqama)}
              GetNextPrayerTimes={() =>
                handleGetNextPrayerTimes(todayPrayerTimes!)
              }
              GoTo={GoTo}
            />
          </div>
        ))}

        {/* Row 2: date info */}
        <div className="col-span-6 flex items-center justify-center">
          {todayPrayerTimes && (
            <TimeDateInfo
              data={[todayPrayerTimes["Hijri"], todayPrayerTimes["Hijri_ar"]]}
            />
          )}
        </div>

        {/* Row 3: footer */}
        <div className="col-span-6">
          <IZR GoTo={GoTo} />
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
