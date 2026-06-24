import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { PrayerName } from "@/api/gen";
import { useNextPrayer } from "@/contexts";
import usePrayerIqama from "@/hooks/usePrayerIqama";
import { useTimer } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";
import { nowTime } from "@/utils/time-utils";
import PrayerNames from "./PrayerNames";
import PrayerTimeDisplay from "./PrayerTimeDisplay";
import PrayerTimer from "./PrayerTimer";

interface PrayerCardProps {
	prayerName: PrayerName;
	prayerTime?: string;
}

function PrayerCard({ prayerName, prayerTime }: PrayerCardProps) {
	const navigate = useNavigate();
	const nextPrayer = useNextPrayer();
	const [prayerReached, setPrayerReached] = useState(false);

	const { prayerIqama } = usePrayerIqama(prayerName);
	const isNextPrayer =
		nextPrayer.nextPrayerName === prayerName ||
		(prayerName === "jumah" && nextPrayer.nextPrayerName === "dhuhr");

	const toHHMM = (time: string) => time.split(":").slice(0, 2).join(":");
	const toMinutes = (time: string) => {
		const [hours, minutes] = time.split(":").slice(0, 2).map(Number);
		return hours * 60 + minutes;
	};

	const getIqamaTime = (): string | null => {
		if (!prayerIqama) return null;

		if (prayerIqama.mode === "fixed" && prayerIqama?.fixed_time) {
			return toHHMM(prayerIqama.fixed_time);
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
	const normalizedPrayerTime = prayerTime ? toHHMM(prayerTime) : null;
	const effectivePrayerTime =
		normalizedPrayerTime ||
		(prayerIqama?.mode === "fixed" && iqamaTime ? iqamaTime : null);

	const isInIqamaWindow = useMemo(() => {
		if (!effectivePrayerTime || !iqamaTime) return false;

		const now = nowTime({});
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const prayerMinutes = toMinutes(effectivePrayerTime);
		const iqamaMinutes = toMinutes(iqamaTime);

		return currentMinutes >= prayerMinutes && currentMinutes < iqamaMinutes;
	}, [effectivePrayerTime, iqamaTime]);

	useEffect(() => {
		if (!effectivePrayerTime) {
			setPrayerReached(false);
			return;
		}

		const now = nowTime({});
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const prayerMinutes = toMinutes(effectivePrayerTime);

		if (!iqamaTime) {
			setPrayerReached(currentMinutes >= prayerMinutes);
			return;
		}

		const iqamaMinutes = toMinutes(iqamaTime);
		setPrayerReached(
			currentMinutes >= prayerMinutes && currentMinutes < iqamaMinutes,
		);
	}, [effectivePrayerTime, iqamaTime]);

	// Timer for prayer time
	const prayerTimer = useTimer({
		targetTime: effectivePrayerTime || "00:00",
		onReached: () => {
			setPrayerReached(true);
		},
		isActive: isNextPrayer && !!effectivePrayerTime && !prayerReached,
	});

	// Timer for iqama time (only show after prayer time reached)
	const iqamaTimer = useTimer({
		targetTime: iqamaTime || "00:00:00",
		onReached: () => {
			console.log("Iqama reached for", prayerName);
			navigate({
				to: "/no-phone/$countdown",
				params: { countdown: prayerName === "jumah" ? "15" : "7" },
			});
		},
		isActive: (isNextPrayer || isInIqamaWindow) && !!iqamaTime && prayerReached,
	});

	const shouldShowIqamaTimer =
		(isNextPrayer || isInIqamaWindow) &&
		prayerReached &&
		iqamaTime &&
		iqamaTimer.timeRemaining !== "00:00:00";
	const isActivePrayer = isNextPrayer || isInIqamaWindow;
	// Blink when within 5 minutes (300 seconds) before the time0
	const isBlinkingPrayer =
		isNextPrayer && !prayerReached && prayerTimer.secondsRemaining <= 300;
	const isBlinkingIqama = shouldShowIqamaTimer
		? iqamaTimer.secondsRemaining <= 300
		: false;

	return (
		<div
			className={cn(
				"relative flex h-full flex-col items-center justify-center gap-[1vh] overflow-hidden rounded-4xl p-[1.5vw] shadow-md transition-all glass-bg",
				isActivePrayer ? "bg-[rgba(26,58,46,1)] text-white" : "",
				isBlinkingPrayer || isBlinkingIqama ? "animate-pulse" : "",
			)}
		>
			<div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-[1vh]">
				<PrayerNames prayerName={prayerName} isActive={isActivePrayer} />

				<div className="flex flex-col items-center gap-[1.5vh]">
					<PrayerTimeDisplay
						label="adhan"
						time={effectivePrayerTime ?? "--:--"}
						isActive={isActivePrayer}
					/>
					{iqamaTime && (
						<PrayerTimeDisplay
							label="iqama"
							time={iqamaTime}
							isActive={isActivePrayer}
						/>
					)}
				</div>

				{/* Prayer Timer */}
				{isNextPrayer && !prayerReached && effectivePrayerTime && (
					<PrayerTimer
						timeRemaining={prayerTimer.timeRemaining}
						label="Bis Adhan"
						isBlink={isBlinkingPrayer}
						isActive={isActivePrayer}
					/>
				)}

				{/* Iqama Timer */}
				{shouldShowIqamaTimer && (
					<PrayerTimer
						timeRemaining={iqamaTimer.timeRemaining}
						label="Bis Iqama"
						isBlink={isBlinkingIqama ?? false}
						isActive={isActivePrayer}
					/>
				)}
			</div>
		</div>
	);
}

export default PrayerCard;
