import type { PrayerName, PrayerTimesOut } from "@/api/gen";
import PrayerCard from "./prayer/components/PrayerCard";

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

interface PrayerTimesGridProps {
	prayerTimes?: PrayerTimesOut | null;
}

function PrayerTimesGrid({ prayerTimes }: PrayerTimesGridProps) {
	const isFriday = new Date().getDay() === 5; // Friday
	const prayerOrder = isFriday
		? PRAYER_ORDER.map((prayer) =>
				prayer === "dhuhr" ? ("jumah" as PrayerName) : prayer,
			)
		: PRAYER_ORDER;

	return (
		<section className="prayer-grid" aria-label="Prayer times">
			<div className="prayer-grid__cards">
				{prayerOrder.map((prayerName) => {
					let prayerTime =
						prayerTimes?.[prayerName as keyof typeof prayerTimes];

					// Override jumah time to 13:30 on Friday
					// if (isFriday && prayerName === "dhuhr") {
					if (isFriday && prayerName === "dhuhr") {
						prayerName = "jumah"; // Update the prayer name to jumah
						prayerTime = undefined;
					}

					return (
						<PrayerCard
							key={prayerName}
							prayerName={prayerName}
							prayerTime={prayerTime}
						/>
					);
				})}
			</div>
		</section>
	);
}

export default PrayerTimesGrid;
