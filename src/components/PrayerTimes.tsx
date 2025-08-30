import { useEffect, useState } from "react";
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

interface props {
  GoTo: (what: string) => void;
}

const PrayerTimes = ({ GoTo }: props) => {
  const [TodayPrayerTimes, setTodayPrayerTimes] =
    useState<DayPrayerTimes | null>(null);
  const [NextPrayer, setNextPrayer] = useState<string | null>(null);

  // gridTemplateColumns is driven by which prayer is next
  const [PrayersLayout, setPrayersLayout] = useState<string>(
    "1fr 1fr 1fr 1fr 1fr 1fr"
  );

  const [iqamaTimes, setIqamaTime] = useState({
    asr: 15,
    dhuhr: 15,
    fajr: 15,
    isha: 0,
    jumaa: 0,
    maghrib: 5,
    tarawih: 0,
    shuruq: 0,
  });

  const FetchTodayPrayerTimes = async () => {
    const ptimes: DayPrayerTimes =
      (await FetchCurrentDayPrayerTimes()) as DayPrayerTimes;
    HandleGetNextPrayerTimes(ptimes);
    setTodayPrayerTimes(ptimes);
    const iqamas = GetIqamaTimes();
    setIqamaTime(iqamas);
  };

  useEffect(() => {
    FetchTodayPrayerTimes();
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      const today = new Date();
      const time = today.getHours();
      if (time === 0) {
        await FetchTodayPrayerTimes();
      }
    }, 5 * 60 * 5000);
    return () => clearInterval(id);
  }, []);

  const HandleGetNextPrayerTimes = (ptimes: DayPrayerTimes) => {
    const next = getNextPrayerTime(ptimes);
    switch (next.prayer) {
      case "Fajr":
        setPrayersLayout("1.5fr 1fr 1fr 1fr 1fr 1fr");
        break;
      case "Shuruq":
        setPrayersLayout("1fr 1.5fr 1fr 1fr 1fr 1fr");
        break;
      case "Dhuhr":
      case "Jumaa":
        setPrayersLayout("1fr 1fr 1.5fr 1fr 1fr 1fr");
        break;
      case "Asr":
        setPrayersLayout("1fr 1fr 1fr 1.5fr 1fr 1fr");
        break;
      case "Maghrib":
        setPrayersLayout("1fr 1fr 1fr 1fr 1.5fr 1fr");
        break;
      case "Isha":
        setPrayersLayout("1fr 1fr 1fr 1fr 1fr 1.5fr");
        break;
    }

    setNextPrayer(next.prayer);
    if (next.prayer === "none") {
      setTimeout(() => {
        GoTo("events");
      }, 2 * 60 * 1000);
    }
  };

  const HandleNextDay = async () => {
    const ptimes: DayPrayerTimes =
      (await FetchCurrentDayPrayerTimes()) as DayPrayerTimes;
    HandleGetNextPrayerTimes(ptimes);
    setTodayPrayerTimes(ptimes);
  };

  const prayer_times = [
    {
      de: "Fajr",
      ar: "الفجر",
      time: TodayPrayerTimes?.Fajr,
      key: "Fajr",
      iqama: iqamaTimes.fajr,
    },
    {
      de: "Shuruq",
      ar: "شروق",
      time: TodayPrayerTimes?.Shuruq,
      key: "Shuruq",
      iqama: iqamaTimes.shuruq,
    },
    {
      de: "Asr",
      key: "Asr",
      ar: "العصر",
      time: TodayPrayerTimes?.Asr,
      iqama: iqamaTimes.asr,
    },
    {
      de: "Maghrib",
      key: "Maghrib",
      ar: "المغرب",
      time: TodayPrayerTimes?.Maghrib,
      iqama: iqamaTimes.maghrib,
    },
    {
      de: "Isha",
      key: "Isha",
      ar: "العشاء",
      time: TodayPrayerTimes?.Isha,
      iqama: iqamaTimes.isha,
    },
  ];

  const prayers =
    new Date().getDay() === 5
      ? [
          ...prayer_times,
          {
            de: "Jumaa",
            key: "Dhuhr",
            ar: "الجمعة",
            time: TodayPrayerTimes?.Jumaa,
            iqama: iqamaTimes.jumaa,
          },
        ]
      : [
          ...prayer_times,
          {
            de: "Dhuhr",
            key: "Dhuhr",
            ar: "الظهر",
            time: TodayPrayerTimes?.Dhuhr,
            iqama: iqamaTimes.dhuhr,
          },
        ];

  // Ensure the display order is: Fajr, Shuruq, Dhuhr/Jumaa, Asr, Maghrib, Isha
  const orderedKeys = ["Fajr", "Shuruq", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const orderedPrayers = orderedKeys
    .map((k) => prayers.find((p) => p.key === k))
    .filter(Boolean) as typeof prayers;

  const getComments = (prayer: string, iqama: number) => {
    let ar = "";
    let de = "";

    if (iqama !== 0 && iqama <= 10) {
      ar = `الإقامة ${iqama} دقائق بعد الأذان`;
      de = `Iqama ${iqama} min nach Adhan`;
    } else if (iqama !== 0 && iqama >= 10) {
      ar = `الإقامة ${iqama} دقيقة بعد الأذان`;
      de = `Iqama ${iqama} min nach Adhan`;
    } else if (iqama === 0) {
      ar = "الإقامة بعد الأذان";
      de = "Iqama direkt nach Adhan";
    }

    switch (prayer) {
      case "Shuruq":
        return ["", ""];
      default:
        return [ar, de];
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${shiny})` }}
      className="h-screen w-screen flex items-center justify-center p-2 box-border bg-[url('../../public/Shiny Overlay.svg')] bg-cover"
    >
      <div
        className="
          grid gap-[10px] h-full w-full rounded-2xl
          grid-rows-[8fr_1fr_1fr]
          transition-[grid-template-columns] duration-1000 ease-in-out
        "
        style={{ gridTemplateColumns: PrayersLayout }}
      >
        {/* Row 1: six prayer cells */}
        {orderedPrayers.map((prayer) => (
          <div
            key={prayer.key}
            className="transition-all duration-1000 ease-in-out"
          >
            <Prayer
              reloadPrayerTimes={HandleNextDay}
              prayer_ar={prayer.ar}
              prayer_de={prayer.de}
              time={prayer.time!}
              next={NextPrayer!}
              iqama={prayer.iqama}
              comments={getComments(prayer.de, prayer.iqama)}
              GetNextPrayerTimes={() =>
                HandleGetNextPrayerTimes(TodayPrayerTimes!)
              }
              GoTo={(what) => GoTo(what)}
            />
          </div>
        ))}

        {/* Row 2: header spanning all columns */}
        <div className="col-span-6 flex items-center justify-center">
          {TodayPrayerTimes && (
            <TimeDateInfo
              data={[TodayPrayerTimes["Hijri"], TodayPrayerTimes["Hijri_ar"]]}
            />
          )}
        </div>

        {/* Row 3: footer spanning all columns */}
        <div className="col-span-6">
          <IZR GoTo={GoTo} />
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
