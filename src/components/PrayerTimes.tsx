import { useEffect, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import Prayer from "./Prayer";
import {
  DayPrayerTimes,
  FetchCurrentDayPrayerTimes,
  GetIqamaTimes,
  getNextPrayerTime,
} from "../toolsfn";
import { IZR } from "./IZR";
import TimeDateInfo from "./TimeDateInfo";

interface props {
  GoTo: (what: string) => void;
}

const PrayerTimes = ({ GoTo }: props) => {
  const [TodayPrayerTimes, setTodayPrayerTimes] =
    useState<DayPrayerTimes | null>(null);
  const [NextPrayer, setNextPrayer] = useState<string | null>(null);
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
  useEffect(() => { }, []);
  const FetchTodayPrayerTimes = async () => {
    const ptimes: DayPrayerTimes =
      await FetchCurrentDayPrayerTimes() as DayPrayerTimes;
    HandleGetNextPrayerTimes(ptimes);
    setTodayPrayerTimes(ptimes);
    const iqamas = GetIqamaTimes();
    console.log("log");
    setIqamaTime(iqamas);
    console.log("Fetching");
  };

  useEffect(() => {
    FetchTodayPrayerTimes();
  }, []);

  useEffect(() => {
    setInterval(async () => {
      const today = new Date();
      const time = today.getHours();
      if (time === 0) {
        await FetchTodayPrayerTimes();
      }
    }, 5 * 60 * 5000);
  }, []);

  const HandleGetNextPrayerTimes = (ptimes: DayPrayerTimes) => {
    const next = getNextPrayerTime(ptimes);
    console.log("Handling PrayerTimes", next);

    switch (next.prayer) {
      case "Fajr":
        setPrayersLayout("1.5fr 1fr 1fr 1fr 1fr 1fr");
        break;
      case "Shuruq":
        setPrayersLayout("1fr 1.5fr 1fr 1fr 1fr 1fr");
        break;
      case "Dhuhr":
        setPrayersLayout("1fr 1fr 1.5fr 1fr 1fr 1fr");
        break;
      case "Jumaa":  // Optional: could use same layout as Dhuhr or a unique one
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
        console.log("next is none")
        GoTo("events")
      }, 2 * 60 * 1000);
    }
  };

  // useEffect(() => {
  //   // TodayPrayerTimes && HandleGetNextPrayerTimes(TodayPrayerTimes);
  //   setNextPrayer("Fajr");
  //   setPrayersLayout("2fr 1fr 1fr 1fr 1fr");
  // }, [NextPrayer]);

  const HandleNextDay = async () => {
    console.log("hnalding next day");

    const ptimes: DayPrayerTimes =
      await FetchCurrentDayPrayerTimes() as DayPrayerTimes;
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
      // iqama: 0,
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


  const getComments = (prayer: string, iqama: number) => {
    let ar = ""
    let de = ""

    if (iqama !== 0 && iqama <= 10) {
      ar = `الإقامة ${iqama} دقائق بعد الأذان`
      de = `Iqama ${iqama} min nach Adhan`
      
    }
    else if (iqama !== 0 && iqama >= 10) {
      ar = `الإقامة ${iqama} دقيقة بعد الأذان`
      de = `Iqama ${iqama} min nach Adhan`
    }
    else if (iqama === 0) {
      ar = "الإقامة بعد الأذان"
      de = "Iqama direkt nach Adhan"
    }



    switch (prayer) {
      // case "Fajr": console.log("returning two empty strings"); return ["Iqama 30 min vor Shuruq", "الإقامة قبل الشروق بـ 30 دقيقة"];
      case "Shuruq": console.log("returning two empty strings"); return [" ", " "];
      default: return [ar, de];
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        boxSizing: "border-box",
      }}
    >
      <Grid
        templateAreas={`
          "Fajr Shuruq Dhuhr Asr Maghrib Isha"
          "header header header header header header"
          "footer footer footer footer footer footer"`}
        gridTemplateRows={"8fr 1fr 1fr"}
        gridTemplateColumns={PrayersLayout}
        gap="10px"
        // backgroundColor={colors.primary}
        borderRadius={"1rem"}
        // margin={"1rem"}
        height={"100%"}
        width={"100%"}

        transition={"ease 1s"}
      >
        {prayers.map((prayer) => (
          <GridItem key={prayer.de} area={prayer.key} transition={"ease 2s"}>
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
            ></Prayer>
          </GridItem>
        ))}
        <GridItem area={"footer"}>
          <IZR GoTo={GoTo} />
        </GridItem>
        <GridItem area={"header"}>
          {TodayPrayerTimes && (
            <TimeDateInfo
              data={[TodayPrayerTimes["Hijri"], TodayPrayerTimes["Hijri_ar"]]}
            />
          )}
        </GridItem>
      </Grid>
    </div >
  );
};

export default PrayerTimes;
