import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { CmsIqama } from "@/api/collections/iqama-times/queries";
import type { PrayerName } from "@/api/gen";
import { iqamaQueryOptions, selectIqama } from "@/api/iqama";
import { nowTime } from "@/utils/time-utils";

interface NextPrayerContextValue {
	nextPrayerName: PrayerName | null;
	nextPrayerTime: string | null;
}

const NextPrayerContext = createContext<NextPrayerContextValue | undefined>(
	undefined,
);

interface NextPrayerProviderProps {
	children: ReactNode;
	prayerTimes: Record<string, string> | null;
}

const WEEKDAY_PRAYER_ORDER: PrayerName[] = [
	"fajr",
	"dhuhr",
	"asr",
	"maghrib",
	"isha",
];

const FRIDAY_PRAYER_ORDER: PrayerName[] = [
	"fajr",
	"jumah",
	"asr",
	"maghrib",
	"isha",
];

const NEXT_PRAYER_SWITCH_DELAY_SECONDS = 2;
const EMPTY_IQAMAS: CmsIqama[] = [];

function timeStringToMinutes(timeStr: string): number {
	const [hours, minutes] = timeStr.split(":").slice(0, 2).map(Number);
	return hours * 60 + minutes;
}

function toHHMM(timeStr: string): string {
	return timeStr.split(":").slice(0, 2).join(":");
}

function getPrayerOrder(isFriday: boolean): PrayerName[] {
	return isFriday ? FRIDAY_PRAYER_ORDER : WEEKDAY_PRAYER_ORDER;
}

function getPrayerTimeForName(
	prayerTimes: Record<string, string>,
	prayerName: PrayerName,
	isFriday: boolean,
): string | undefined {
	if (isFriday && prayerName === "jumah") {
		return prayerTimes.jumah || undefined;
	}

	return prayerTimes[prayerName];
}

export function NextPrayerProvider({
	children,
	prayerTimes,
}: NextPrayerProviderProps) {
	const { data: iqamas = EMPTY_IQAMAS } = useQuery(iqamaQueryOptions());
	const [nextPrayer, setNextPrayer] = useState<NextPrayerContextValue>({
		nextPrayerName: null,
		nextPrayerTime: null,
	});

	useEffect(() => {
		const updateNextPrayer = () => {
			if (!prayerTimes) return;

			const now = nowTime({});
			const isFriday = now.getDay() === 5;
			const prayerOrder = getPrayerOrder(isFriday);
			const currentMinutes = now.getHours() * 60 + now.getMinutes();
			const currentSeconds = now.getSeconds();
			const iqamaTimesByPrayer: Partial<Record<PrayerName, string>> = {};
			for (const prayerName of prayerOrder) {
				const iqama = selectIqama(iqamas, prayerName, now);
				const prayerTime = getPrayerTimeForName(
					prayerTimes,
					prayerName,
					isFriday,
				);
				if (iqama?.type === "fixed" && iqama.fixed_time) {
					iqamaTimesByPrayer[prayerName] = toHHMM(iqama.fixed_time);
				} else if (
					iqama?.type === "offset" &&
					iqama.offset_minutes != null &&
					prayerTime
				) {
					const minutes =
						(timeStringToMinutes(prayerTime) + iqama.offset_minutes + 1440) %
						1440;
					iqamaTimesByPrayer[prayerName] =
						`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
				}
			}

			// If we are between Adhan and Iqama for any prayer,
			// keep that prayer active instead of switching to the next one.
			for (const prayerName of prayerOrder) {
				const prayerTimeStr = getPrayerTimeForName(
					prayerTimes,
					prayerName,
					isFriday,
				);
				const iqamaTimeStr = iqamaTimesByPrayer[prayerName];

				if (!iqamaTimeStr) continue;

				const prayerMinutes = prayerTimeStr
					? timeStringToMinutes(prayerTimeStr)
					: null;
				const iqamaMinutes = timeStringToMinutes(iqamaTimeStr);

				const isBetweenAdhanAndIqama =
					prayerMinutes !== null &&
					currentMinutes >= prayerMinutes &&
					currentMinutes < iqamaMinutes;
				const isIqamaGraceWindow =
					currentMinutes === iqamaMinutes &&
					currentSeconds < NEXT_PRAYER_SWITCH_DELAY_SECONDS;

				if (isBetweenAdhanAndIqama || isIqamaGraceWindow) {
					setNextPrayer({
						nextPrayerName: prayerName,
						nextPrayerTime: iqamaTimeStr,
					});
					return;
				}
			}

			let nextPrayerIdx = -1;
			let nextTime = null;

			// Find next prayer
			for (const prayerName of prayerOrder) {
				const prayerTimeStr =
					getPrayerTimeForName(prayerTimes, prayerName, isFriday) ||
					iqamaTimesByPrayer[prayerName];
				if (!prayerTimeStr) continue;

				const prayerMinutes = timeStringToMinutes(prayerTimeStr);
				if (prayerMinutes > currentMinutes) {
					nextPrayerIdx = prayerOrder.indexOf(prayerName);
					nextTime = prayerTimeStr;
					break;
				}
			}

			// If no prayer found today, do not highlight any next prayer
			if (nextPrayerIdx === -1) {
				setNextPrayer({
					nextPrayerName: null,
					nextPrayerTime: null,
				});
				return;
			}

			const nextPrayerName = prayerOrder[nextPrayerIdx];

			setNextPrayer({
				nextPrayerName,
				nextPrayerTime: nextTime,
			});
		};

		updateNextPrayer();
		const interval = setInterval(updateNextPrayer, 1000);

		return () => clearInterval(interval);
	}, [prayerTimes, iqamas]);

	return (
		<NextPrayerContext.Provider value={nextPrayer}>
			{children}
		</NextPrayerContext.Provider>
	);
}

export function useNextPrayer() {
	const context = useContext(NextPrayerContext);
	if (context === undefined) {
		throw new Error("useNextPrayer must be used within a NextPrayerProvider");
	}
	return context;
}
