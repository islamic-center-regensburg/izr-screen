/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios"
import { izr_server } from "./config"


/* These functions are needed to store and load data from local storage */

// items keys 
// ----------------
// yearPrayerTimes --> stores prayer times of the year
// ----------------


export const StoreItem = (item: string, data: any) => {
  localStorage.setItem(item, JSON.stringify(data))
}
export const LoadItem = (item: string) => {
  try {
    const value = localStorage.getItem(item)
    return value ? JSON.parse(value) : null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    const asfn = async () => {
      await FetchIqamaTimes()
      await FetchAndStorePrayerTimes()
      const value = localStorage.getItem(item)
      return value ? JSON.parse(value) : null
    }
    return asfn()
  }
}

/* this function loads the prayer time for a whole year and stores it in a json file in public folder */

export interface DayPrayerTimes {
  Asr: string
  Datum: string
  Dhuhr: string
  Fajr: string
  Hijri: string
  Hijri_ar: string
  Isha: string
  Jumaa: string
  Maghrib: string
  Tarawih: string
}


function transformArrayToObject(array: DayPrayerTimes[]) {

  const transformedObject = {} as any;
  array.forEach(obj => {
    const date = obj.Datum;
    transformedObject[date] = obj;
  });
  return transformedObject;
}

export const FetchAndStorePrayerTimes = async () => {
  alert("Fetching prayer times... Please wait unitl you are notified !");

  let wholeYearPrayerTimes: DayPrayerTimes[] = []
  await axios.post<DayPrayerTimes[]>(izr_server + "/calculTimes/", {
    city_name: "Regensburg",
    lat: 49.007734,
    lng: 12.102841,
    start_date: { y: new Date().getFullYear(), m: 1, d: 1 },
    end_date: { y: new Date().getFullYear(), m: 12, d: 31 },
    method: 10,
  }).then((resp) => { wholeYearPrayerTimes = resp.data; alert("Prayer times successfully fetched and stored! Click on Reload !"); }).catch(() => alert("Error: Prayer times could not be fetched."))
  const tranformedPrayerTimes = transformArrayToObject(wholeYearPrayerTimes)
  console.log("prayer times of the while year")
  console.log(tranformedPrayerTimes)
  StoreItem("yearPrayerTimes", { value: tranformedPrayerTimes })
}


/* this function loads the prayer time from json file and if the current day is not found it loads and stores the prayer the new current year  */

export const getTime = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`
}


export const FetchCurrentDayPrayerTimes = async (fake: boolean = false) => {
  if (fake) {
    const now = new Date()
    const min = 60 * 1000
    return {
      Datum: now.toDateString(),
      Hijri: now.toDateString(),
      Hijri_ar: now.toDateString(),
      Fajr: getTime(new Date(now.getTime() - 1 * min)),
      Dhuhr: getTime(new Date(now.getTime() + 2 * min)),
      Jumaa: getTime(new Date(now.getTime() + 1 * min)),
      Asr: getTime(new Date(now.getTime() + 4 * min)),
      Maghrib: getTime(new Date(now.getTime() + 6 * min)),
      Isha: getTime(new Date(now.getTime() + 8 * min)),
    }
  }
  let today =
    String(new Date().getDate()).padStart(2, '0') + "-" +
    String(new Date().getMonth() + 1).padStart(2, '0') + "-" +
    new Date().getFullYear();
  let todayPrayerTimes: DayPrayerTimes | null = null
  // let today = "31-5-2024"

  console.log("Today", today);


  try {
    let testPrayerTimes = LoadItem("yearPrayerTimes").value
    todayPrayerTimes = testPrayerTimes[today] as DayPrayerTimes
  } catch (err) {
    console.log("Fetching data again !")
    await FetchAndStorePrayerTimes()
    let testPrayerTimes = LoadItem("yearPrayerTimes").value
    todayPrayerTimes = testPrayerTimes[today] as DayPrayerTimes
  }
  todayPrayerTimes["Isha"] = "20:30"
  return todayPrayerTimes
}
export const GetIqamaTimes = (fake: boolean = false) => {
  if (fake) {
    return {
      Fajr: 1,
      Dhuhr: 2,
      Jumaa: 0,
      Asr: 2,
      Maghrib: 2,
      Isha: 2,
    }
  }
  FetchIqamaTimes()
  const iqamas = LoadItem("iqama").value;
  return iqamas
}



export const FetchIqamaTimes = async () => {

  let iqamaTimes = null;
  await axios.get(izr_server + "/iqamah").then((response) => { iqamaTimes = response.data[0] })
  StoreItem("iqama", { value: iqamaTimes })
}


export function getNextPrayerTime(prayerTimes: DayPrayerTimes) {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const currentDay = currentDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // Define the prayer order
  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  // If it's Friday, replace Dhuhr with Jumaa
  if (currentDay === 5) {
    prayerOrder[1] = "Jumaa";
  }

  // Find the next prayer
  for (const prayer of prayerOrder) {
    if (prayerTimes.hasOwnProperty(prayer)) {
      const [prayerHour, prayerMinute] = prayerTimes[prayer as keyof DayPrayerTimes]
        .split(":")
        .map(Number);
      if (
        currentHour < prayerHour ||
        (currentHour === prayerHour && currentMinute < prayerMinute)
      ) {
        console.log("Next Prayer : ", prayer)
        return { prayer};
      }
    }
  }

  // If all prayers have passed for the day, return the first prayer for the next day (Fajr)
  return { prayer: "none" };
}