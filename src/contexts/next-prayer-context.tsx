import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import type { PrayerName } from "@/api/gen";
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

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function timeStringToMinutes(timeStr: string): number {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
}

export function NextPrayerProvider({
	children,
	prayerTimes,
}: NextPrayerProviderProps) {
	const [nextPrayer, setNextPrayer] = useState<NextPrayerContextValue>({
		nextPrayerName: null,
		nextPrayerTime: null,
	});

	useEffect(() => {
		const updateNextPrayer = () => {
			if (!prayerTimes) return;

			const now = nowTime({});
			const currentMinutes = now.getHours() * 60 + now.getMinutes();

			let nextPrayerIdx = -1;
			let nextTime = null;

			// Find next prayer
			for (const prayerName of PRAYER_ORDER) {
				const prayerTimeStr = prayerTimes[prayerName];
				if (!prayerTimeStr) continue;

				const prayerMinutes = timeStringToMinutes(prayerTimeStr);
				if (prayerMinutes > currentMinutes) {
					nextPrayerIdx = PRAYER_ORDER.indexOf(prayerName);
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

			const nextPrayerName = PRAYER_ORDER[nextPrayerIdx];

			setNextPrayer({
				nextPrayerName,
				nextPrayerTime: nextTime,
			});
		};

		updateNextPrayer();
		const interval = setInterval(updateNextPrayer, 1000);

		return () => clearInterval(interval);
	}, [prayerTimes]);

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
