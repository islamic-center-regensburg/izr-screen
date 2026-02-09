import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { PrayerName } from "@/api/gen";
import { getPrayerIqamaQueryOptions } from "@/api/prayer_iqama/queries";
import { useNextPrayer } from "@/contexts";
import { useTimer } from "@/hooks/useTimer";
import PrayerNames from "./PrayerNames";
import PrayerTimeDisplay from "./PrayerTimeDisplay";
import PrayerTimer from "./PrayerTimer";

interface PrayerCardProps {
	prayerName: PrayerName;
	prayerTime?: string;
}

function PrayerCard({ prayerName, prayerTime }: PrayerCardProps) {
	const nextPrayer = useNextPrayer();
	const [prayerReached, setPrayerReached] = useState(false);

	const { data: prayerIqamaData } = useQuery(
		getPrayerIqamaQueryOptions({
			prayer_name: prayerName,
		}),
	);

	const prayer_iqama = prayerIqamaData?.data[0];
	const isNextPrayer = nextPrayer.nextPrayerName === prayerName;

	const getIqamaTime = (): string | null => {
		if (!prayer_iqama) return null;

		// Helper to format time without seconds (HH:MM:SS -> HH:MM)
		const formatTimeWithoutSeconds = (time: string): string => {
			return time.split(":").slice(0, 2).join(":");
		};

		if (prayer_iqama.mode === "fixed" && prayer_iqama?.fixed_time) {
			return formatTimeWithoutSeconds(prayer_iqama.fixed_time);
		}

		if (
			prayer_iqama.mode === "offset" &&
			prayerTime &&
			prayer_iqama.offset_minutes
		) {
			const [hours, minutes] = prayerTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + prayer_iqama.offset_minutes;
			const iqamaHours = Math.floor(totalMinutes / 60);
			const iqamaMinutes = totalMinutes % 60;
			return `${String(iqamaHours).padStart(2, "0")}:${String(iqamaMinutes).padStart(2, "0")}`;
		}

		return null;
	};

	const iqamaTime = getIqamaTime();

	// Timer for prayer time
	const prayerTimer = useTimer({
		targetTime: prayerTime || "00:00",
		onReached: () => {
			setPrayerReached(true);
		},
		isActive: isNextPrayer && !!prayerTime && !prayerReached,
	});

	// Timer for iqama time (only show after prayer time reached)
	const iqamaTimer = useTimer({
		targetTime: iqamaTime || "00:00",
		isActive: isNextPrayer && !!iqamaTime && prayerReached,
	});

	const shouldShowIqamaTimer = isNextPrayer && prayerReached && iqamaTime;
	// Blink when within 5 minutes (300 seconds) before the time0
	const isBlinkingPrayer =
		isNextPrayer && !prayerReached && prayerTimer.secondsRemaining <= 300;
	const isBlinkingIqama = shouldShowIqamaTimer
		? iqamaTimer.secondsRemaining <= 300
		: false;

	return (
		<div
			className={`flex h-full flex-col items-center justify-center gap-[1vh] rounded-xl border border-muted p-[1.5vw] shadow-md transition-all ${
				isBlinkingPrayer || isBlinkingIqama
					? "animate-pulse ring-2 ring-primary"
					: ""
			}`}
		>
			<PrayerNames prayerName={prayerName} />

			<div className="flex flex-col items-center gap-[1.5vh]">
				<PrayerTimeDisplay label="Gebetszeit" time={prayerTime ?? "--:--"} />
				{iqamaTime && <PrayerTimeDisplay label="Iqama-Zeit" time={iqamaTime} />}
			</div>

			{/* Prayer Timer */}
			{isNextPrayer && !prayerReached && prayerTime && (
				<PrayerTimer
					timeRemaining={prayerTimer.timeRemaining}
					label="Bis zum Gebet"
					isBlink={isBlinkingPrayer}
				/>
			)}

			{/* Iqama Timer */}
			{shouldShowIqamaTimer && (
				<PrayerTimer
					timeRemaining={iqamaTimer.timeRemaining}
					label="Bis zur Iqama"
					isBlink={isBlinkingIqama ?? false}
				/>
			)}
		</div>
	);
}

export default PrayerCard;
