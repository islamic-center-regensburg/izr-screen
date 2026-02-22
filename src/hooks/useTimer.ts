import { useEffect, useRef, useState } from "react";
import { nowTime } from "@/utils/time-utils";

interface UseTimerOptions {
	targetTime: string; // "HH:MM" format
	onReached?: () => void;
	isActive?: boolean;
}

interface TimerResult {
	timeRemaining: string;
	secondsRemaining: number;
	isExpired: boolean;
}

export function useTimer({
	targetTime,
	onReached,
	isActive = true,
}: UseTimerOptions): TimerResult {
	const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00");
	const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
	const [isExpired, setIsExpired] = useState<boolean>(false);
	const hasReachedRef = useRef(false);

	useEffect(() => {
		if (!isActive) {
			hasReachedRef.current = false;
			return;
		}

		hasReachedRef.current = false;

		const calculateTime = () => {
			const now = nowTime({});
			const nowMs =
				now.getHours() * 3600000 +
				now.getMinutes() * 60000 +
				now.getSeconds() * 1000 +
				now.getMilliseconds();

			const [targetHours, targetMinutes] = targetTime.split(":").map(Number);
			const targetMs = targetHours * 3600000 + targetMinutes * 60000;
			const diffMs = targetMs - nowMs;

			if (diffMs <= 0) {
				setIsExpired(true);
				setTimeRemaining("00:00:00");
				setSecondsRemaining(0);

				if (!hasReachedRef.current && onReached) {
					hasReachedRef.current = true;
					onReached();
				}

				return;
			}

			const diffSeconds = Math.ceil(diffMs / 1000);

			setIsExpired(false);
			setSecondsRemaining(diffSeconds);

			const hours = Math.floor(diffSeconds / 3600);
			const minutes = Math.floor((diffSeconds % 3600) / 60);
			const seconds = diffSeconds % 60;
			setTimeRemaining(
				`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
			);
		};

		calculateTime();
		const interval = setInterval(calculateTime, 250);

		return () => clearInterval(interval);
	}, [targetTime, onReached, isActive]);

	return {
		timeRemaining,
		secondsRemaining,
		isExpired,
	};
}
