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
  GoToEvents: (what: string) => void;
}

const PrayerTimes = ({ GoToEvents }: props) => {
  const [TodayPrayerTimes, setTodayPrayerTimes] =
    useState<DayPrayerTimes | null>(null);
  const [NextPrayer, setNextPrayer] = useState<string | null>(null);
  const [PrayersLayout, setPrayersLayout] = useState<string>(
    "1fr 1fr 1fr 1fr 1fr"
  );
  const [iqamaTimes, setIqamaTime] = useState({
    asr: 15,
    dhuhr: 15,
    fajr: 15,
    isha: 5,
    jumaa: 0,
    maghrib: 5,
    tarawih: 0,
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
        setPrayersLayout("1.5fr 1fr 1fr 1fr 1fr");
        break;
      case "Dhuhr":
        setPrayersLayout("1fr 1.5fr 1fr 1fr 1fr");
        break;
      case "Jumaa":
        setPrayersLayout("1fr 1.5fr 1fr 1fr 1fr");
        break;
      case "Asr":
        setPrayersLayout("1fr 1fr 1.5fr 1fr 1fr");
        break;
      case "Maghrib":
        setPrayersLayout("1fr 1fr 1fr 1.5fr 1fr");
        break;
      case "Isha":
        setPrayersLayout("1fr 1fr 1fr 1fr 1.5fr");
        break;
    }
    setNextPrayer(next.prayer);
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
      de: "Tarawih",
      key: "Tarawih",
      ar: "التراويح",
      time: TodayPrayerTimes?.Tarawih,
      iqama: iqamaTimes.tarawih,
    }
    // {
    //   de: "Isha",
    //   key: "Isha",
    //   ar: "العشاء",
    //   time: TodayPrayerTimes?.Isha,
    //   iqama: iqamaTimes.isha,
    // },
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
          "Fajr Dhuhr Asr Maghrib Tarawih"
          "header header header header header"
          "footer footer footer footer footer"`}
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
              GetNextPrayerTimes={() =>
                HandleGetNextPrayerTimes(TodayPrayerTimes!)
              }
              GoToEvents={(what) => GoToEvents(what)}
            ></Prayer>
          </GridItem>
        ))}
        <GridItem area={"footer"}>
          <IZR GoTo={GoToEvents} />
        </GridItem>
        <GridItem area={"header"}>
          {TodayPrayerTimes && (
            <TimeDateInfo
              data={[TodayPrayerTimes["Hijri"], TodayPrayerTimes["Hijri_ar"]]}
            />
          )}
        </GridItem>
      </Grid>
    </div>
  );
};

export default PrayerTimes;
