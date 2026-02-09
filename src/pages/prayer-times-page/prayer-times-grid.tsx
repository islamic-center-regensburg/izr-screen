import type { PrayerName, PrayerTimesOut } from "@/api/gen";
import Prayer from "./prayer";

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

interface PrayerTimesGridProps {
	prayerTimes?: PrayerTimesOut | null;
}

function PrayerTimesGrid({ prayerTimes }: PrayerTimesGridProps) {
	return (
		<div className="flex-1 overflow-auto">
			<div className="grid h-full grid-cols-[repeat(auto-fit,minmax(15vw,1fr))] grid-rows-1 gap-[1vw] p-[1vw]">
				{PRAYER_ORDER.map((prayerName) => {
					const prayerTime =
						prayerTimes?.[prayerName as keyof typeof prayerTimes];
					return (
						<Prayer
							key={prayerName}
							prayerName={prayerName}
							prayerTime={prayerTime}
						/>
					);
				})}
			</div>
		</div>
	);
}

export default PrayerTimesGrid;
