import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrayerName } from "@/api/gen";
import { useNextPrayer } from "@/contexts";
import { useScreenConfig } from "@/contexts/screen-config-context";
import usePrayerIqama from "@/hooks/usePrayerIqama";
import { useTimer } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";
import { nowTime } from "@/utils/time-utils";
import { displayIqamas } from "./iqama-display";
import PrayerNames from "./PrayerNames";
import PrayerTimeDisplay from "./PrayerTimeDisplay";
import PrayerTimer from "./PrayerTimer";

interface PrayerCardProps {
	prayerName: PrayerName;
	prayerTime?: string;
}

function PrayerCard({ prayerName, prayerTime }: PrayerCardProps) {
	const navigate = useNavigate();
	const { isManual } = useScreenConfig();
	const nextPrayer = useNextPrayer();
	const [prayerReached, setPrayerReached] = useState(false);

	const { prayerIqama, data: iqamas = [] } = usePrayerIqama(prayerName);
	const ownsToday =
		prayerName === "jumah"
			? nowTime({}).getDay() === 5
			: prayerName !== "dhuhr" || nowTime({}).getDay() !== 5;
	const isNextPrayer = ownsToday && nextPrayer.nextPrayerName === prayerName;

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
			prayerIqama.offset_minutes != null
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
	const effectivePrayerTime = normalizedPrayerTime;
	const fixedIqamaOnly =
		!effectivePrayerTime && prayerIqama?.mode === "fixed" && !!iqamaTime;
	const onIqamaReached = useCallback(() => {
		if (isManual) return;
		navigate({
			to: "/no-phone/$countdown",
			params: { countdown: prayerName === "jumah" ? "15" : "7" },
		});
	}, [isManual, navigate, prayerName]);
	const onPrayerReached = useCallback(() => setPrayerReached(true), []);

	const isInIqamaWindow = useMemo(() => {
		if (!ownsToday || !effectivePrayerTime || !iqamaTime) return false;

		const now = nowTime({});
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const prayerMinutes = toMinutes(effectivePrayerTime);
		const iqamaMinutes = toMinutes(iqamaTime);

		return currentMinutes >= prayerMinutes && currentMinutes < iqamaMinutes;
	}, [effectivePrayerTime, iqamaTime, ownsToday]);

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
		onReached: onPrayerReached,
		isActive: isNextPrayer && !!effectivePrayerTime && !prayerReached,
	});

	// Timer for iqama time (only show after prayer time reached)
	const iqamaTimer = useTimer({
		targetTime: iqamaTime || "00:00:00",
		onReached: onIqamaReached,
		isActive:
			(isNextPrayer || isInIqamaWindow) &&
			!!iqamaTime &&
			(prayerReached || fixedIqamaOnly),
	});

	const shouldShowIqamaTimer =
		(isNextPrayer || isInIqamaWindow) &&
		(prayerReached || fixedIqamaOnly) &&
		iqamaTime &&
		iqamaTimer.timeRemaining !== "00:00:00";
	const isActivePrayer = isNextPrayer || isInIqamaWindow;

	return (
		<div
			className={cn("prayer-card", isActivePrayer ? "prayer-card--active" : "")}
			aria-current={isNextPrayer ? "true" : undefined}
		>
			<div className="prayer-card__content">
				<PrayerNames prayerName={prayerName} isActive={isActivePrayer} />

				<div className="prayer-card__times">
					{(prayerName !== "jumah" || effectivePrayerTime) && (
						<PrayerTimeDisplay
							label="adhan"
							time={effectivePrayerTime ?? "--:--"}
							isActive={isActivePrayer}
						/>
					)}
					{(iqamas.length
						? displayIqamas(iqamas, prayerName, prayerTime)
						: iqamaTime
							? [iqamaTime]
							: []
					).map((time, index) => (
						<PrayerTimeDisplay
							key={`${prayerName}-${time}`}
							label="iqama"
							jumuahNumber={prayerName === "jumah" ? index + 1 : undefined}
							time={time}
							isActive={isActivePrayer}
						/>
					))}
				</div>

				{isNextPrayer && !prayerReached && effectivePrayerTime && (
					<PrayerTimer
						timeRemaining={prayerTimer.timeRemaining}
						label="Bis Adhan"
						isActive={isActivePrayer}
					/>
				)}

				{shouldShowIqamaTimer && (
					<PrayerTimer
						timeRemaining={iqamaTimer.timeRemaining}
						label="Bis Iqama"
						isActive={isActivePrayer}
					/>
				)}
			</div>
		</div>
	);
}

export default PrayerCard;
