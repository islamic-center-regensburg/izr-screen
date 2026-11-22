import type { PrayerName, PrayerTimesOut } from "@/api/gen";
import { useNextPrayer } from "@/contexts";
import usePrayerIqama from "@/hooks/usePrayerIqama";
import { useTimer } from "@/hooks/useTimer";
import { nowTime } from "@/utils/time-utils";
import { displayIqamas } from "./prayer/components/iqama-display";
import PrayerCard from "./prayer/components/PrayerCard";
import PrayerNames from "./prayer/components/PrayerNames";
import PrayerTimeDisplay from "./prayer/components/PrayerTimeDisplay";

const PRAYER_ORDER: PrayerName[] = [
	"fajr",
	"dhuhr",
	"asr",
	"maghrib",
	"isha",
	"jumah",
];

interface PrayerTimesGridProps {
	prayerTimes?: PrayerTimesOut | null;
}

function FeaturedPrayer({ prayerTimes }: PrayerTimesGridProps) {
	const { nextPrayerName, nextPrayerTime, nextPrayerIsTomorrow } =
		useNextPrayer();
	const { data: iqamas = [] } = usePrayerIqama(nextPrayerName ?? "fajr");
	const timer = useTimer({
		targetTime: nextPrayerTime ?? "00:00",
		isActive: !!nextPrayerName && !!nextPrayerTime,
		nextDay: nextPrayerIsTomorrow,
	});
	const adhan = nextPrayerIsTomorrow
		? (nextPrayerTime ?? undefined)
		: nextPrayerName
			? prayerTimes?.[nextPrayerName as keyof PrayerTimesOut]
			: undefined;
	const prayerDate = nowTime({});
	if (nextPrayerIsTomorrow) prayerDate.setDate(prayerDate.getDate() + 1);
	const isIqama =
		!!nextPrayerTime &&
		(!adhan || nextPrayerTime.slice(0, 5) !== adhan.slice(0, 5));
	return (
		<div className="prayer-featured">
			<span className="prayer-featured__eyebrow">
				Nächstes Gebet / الصلاة القادمة
			</span>
			{nextPrayerIsTomorrow && <span>Morgen / غداً</span>}
			{nextPrayerName && nextPrayerTime ? (
				<>
					<PrayerNames prayerName={nextPrayerName} isActive />
					<div className="prayer-featured__times">
						{(nextPrayerName !== "jumah" || adhan) && (
							<PrayerTimeDisplay
								label="adhan"
								time={adhan?.slice(0, 5) ?? "--:--"}
								isActive
							/>
						)}
						{displayIqamas(iqamas, nextPrayerName, adhan, prayerDate).map(
							(time, index) => (
								<PrayerTimeDisplay
									key={`${nextPrayerName}-${time}`}
									label="iqama"
									jumuahNumber={
										nextPrayerName === "jumah" ? index + 1 : undefined
									}
									time={time}
									isActive
								/>
							),
						)}
					</div>
					<div className="prayer-featured__countdown">
						<span>{isIqama ? "Bis Iqama" : "Bis Adhan"}</span>
						<span role="timer" aria-label={isIqama ? "Bis Iqama" : "Bis Adhan"}>
							{timer.timeRemaining.replace(/^(00:)+/, "")}
						</span>
					</div>
				</>
			) : (
				<p className="prayer-featured__empty">
					Nächste Gebetszeit nicht verfügbar
				</p>
			)}
		</div>
	);
}

function PrayerTimesGrid({ prayerTimes }: PrayerTimesGridProps) {
	return (
		<section className="prayer-grid" aria-label="Prayer times">
			<FeaturedPrayer prayerTimes={prayerTimes} />
			<div className="prayer-grid__cards">
				{PRAYER_ORDER.map((prayerName) => {
					const prayerTime =
						prayerTimes?.[prayerName as keyof typeof prayerTimes];

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
