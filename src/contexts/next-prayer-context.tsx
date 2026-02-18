import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	getAllPrayerIqamas,
	type PrayerIqamaOut,
	type PrayerName,
} from "@/api/gen";
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
	const [hours, minutes] = timeStr.split(":").slice(0, 2).map(Number);
	return hours * 60 + minutes;
}

function toHHMM(timeStr: string): string {
	return timeStr.split(":").slice(0, 2).join(":");
}

export function NextPrayerProvider({
	children,
	prayerTimes,
}: NextPrayerProviderProps) {
	const [iqamaByPrayer, setIqamaByPrayer] = useState<
		Partial<Record<PrayerName, PrayerIqamaOut>>
	>({});

	const [nextPrayer, setNextPrayer] = useState<NextPrayerContextValue>({
		nextPrayerName: null,
		nextPrayerTime: null,
	});

	useEffect(() => {
		let isMounted = true;

		const fetchIqamas = async () => {
			try {
				const response = await getAllPrayerIqamas();
				const iqamas = response.data?.data ?? [];

				if (!isMounted) return;

				const nextIqamaMap: Partial<Record<PrayerName, PrayerIqamaOut>> = {};
				for (const iqama of iqamas) {
					nextIqamaMap[iqama.prayer_name] = iqama;
				}

				setIqamaByPrayer(nextIqamaMap);
			} catch {
				if (isMounted) {
					setIqamaByPrayer({});
				}
			}
		};

		void fetchIqamas();

		return () => {
			isMounted = false;
		};
	}, []);

	const iqamaTimesByPrayer = useMemo(() => {
		if (!prayerTimes) return {} as Partial<Record<PrayerName, string>>;

		const times: Partial<Record<PrayerName, string>> = {};
		for (const prayerName of PRAYER_ORDER) {
			const iqama = iqamaByPrayer[prayerName];
			const prayerTimeStr = prayerTimes[prayerName];

			if (!iqama || !prayerTimeStr) continue;

			if (iqama.mode === "fixed" && iqama.fixed_time) {
				times[prayerName] = toHHMM(iqama.fixed_time);
				continue;
			}

			if (iqama.mode === "offset" && iqama.offset_minutes) {
				const prayerMinutes = timeStringToMinutes(prayerTimeStr);
				const iqamaMinutes = prayerMinutes + iqama.offset_minutes;
				const iqamaHours = Math.floor(iqamaMinutes / 60);
				const iqamaMins = iqamaMinutes % 60;
				times[prayerName] =
					`${String(iqamaHours).padStart(2, "0")}:${String(iqamaMins).padStart(2, "0")}`;
			}
		}

		return times;
	}, [prayerTimes, iqamaByPrayer]);

	useEffect(() => {
		const updateNextPrayer = () => {
			if (!prayerTimes) return;

			const now = nowTime({});
			const currentMinutes = now.getHours() * 60 + now.getMinutes();

			// If we are between Adhan and Iqama for any prayer,
			// keep that prayer active instead of switching to the next one.
			for (const prayerName of PRAYER_ORDER) {
				const prayerTimeStr = prayerTimes[prayerName];
				const iqamaTimeStr = iqamaTimesByPrayer[prayerName];

				if (!prayerTimeStr || !iqamaTimeStr) continue;

				const prayerMinutes = timeStringToMinutes(prayerTimeStr);
				const iqamaMinutes = timeStringToMinutes(iqamaTimeStr);

				if (currentMinutes >= prayerMinutes && currentMinutes < iqamaMinutes) {
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
	}, [prayerTimes, iqamaTimesByPrayer]);

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
