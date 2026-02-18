import { useState } from "react";
import type { PrayerName } from "@/api/gen";
import { useNextPrayer } from "@/contexts";
import usePrayerIqama from "@/hooks/usePrayerIqama";
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

	const { prayerIqama } = usePrayerIqama(prayerName);
	const isNextPrayer = nextPrayer.nextPrayerName === prayerName;

	const getIqamaTime = (): string | null => {
		if (!prayerIqama) return null;

		// Helper to format time without seconds (HH:MM:SS -> HH:MM)
		const formatTimeWithoutSeconds = (time: string): string => {
			return time.split(":").slice(0, 2).join(":");
		};

		if (prayerIqama.mode === "fixed" && prayerIqama?.fixed_time) {
			return formatTimeWithoutSeconds(prayerIqama.fixed_time);
		}

		if (
			prayerIqama.mode === "offset" &&
			prayerTime &&
			prayerIqama.offset_minutes
		) {
			const [hours, minutes] = prayerTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + prayerIqama.offset_minutes;
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
		onReached: () => {
			window.location.reload();
		},
		isActive: isNextPrayer && !!iqamaTime && prayerReached,
	});

	const shouldShowIqamaTimer =
		isNextPrayer &&
		prayerReached &&
		iqamaTime &&
		iqamaTimer.timeRemaining !== "00:00:00";
	const isActivePrayer = isNextPrayer;
	// Blink when within 5 minutes (300 seconds) before the time0
	const isBlinkingPrayer =
		isNextPrayer && !prayerReached && prayerTimer.secondsRemaining <= 300;
	const isBlinkingIqama = shouldShowIqamaTimer
		? iqamaTimer.secondsRemaining <= 300
		: false;

	return (
		<div
			className={`relative flex h-full flex-col items-center justify-center gap-[1vh] overflow-hidden rounded-xl border border-muted p-[1.5vw] shadow-md transition-all ${
				isActivePrayer ? "bg-[#1a3a2e] text-white" : ""
			} ${
				isBlinkingPrayer || isBlinkingIqama
					? "animate-pulse ring-2 ring-primary"
					: ""
			}`}
		>
			<div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-[1vh]">
				<PrayerNames prayerName={prayerName} isActive={isActivePrayer} />

				<div className="flex flex-col items-center gap-[1.5vh]">
					<PrayerTimeDisplay
						label="Gebetszeit"
						time={prayerTime ?? "--:--"}
						isActive={isActivePrayer}
					/>
					{iqamaTime && (
						<PrayerTimeDisplay
							label="Iqama-Zeit"
							time={iqamaTime}
							isActive={isActivePrayer}
						/>
					)}
				</div>

				{/* Prayer Timer */}
				{isNextPrayer && !prayerReached && prayerTime && (
					<PrayerTimer
						timeRemaining={prayerTimer.timeRemaining}
						label="Bis zum Gebet"
						isBlink={isBlinkingPrayer}
						isActive={isActivePrayer}
					/>
				)}

				{/* Iqama Timer */}
				{shouldShowIqamaTimer && (
					<PrayerTimer
						timeRemaining={iqamaTimer.timeRemaining}
						label="Bis zur Iqama"
						isBlink={isBlinkingIqama ?? false}
						isActive={isActivePrayer}
					/>
				)}
			</div>

			{isActivePrayer && (
				<img
					src="/ramadan.png"
					alt="Ramadan"
					className="absolute bottom-[1vh] left-1/2 z-0 h-auto w-1/1 -translate-x-1/2 opacity-65"
				/>
			)}
		</div>
	);
}

export default PrayerCard;
