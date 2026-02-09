import { useEffect, useState } from "react";

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

	useEffect(() => {
		if (!isActive) return;

		const calculateTime = () => {
			const now = new Date();
			const currentMinutes = now.getHours() * 60 + now.getMinutes();
			const currentSeconds = now.getSeconds();

			const [targetHours, targetMinutes] = targetTime.split(":").map(Number);
			const targetTotalMinutes = targetHours * 60 + targetMinutes;

			const diff =
				targetTotalMinutes * 60 - (currentMinutes * 60 + currentSeconds);

			// If time has passed, it's expired
			if (diff < 0) {
				setIsExpired(true);
				setTimeRemaining("00:00:00");
				setSecondsRemaining(0);
				return;
			}

			setIsExpired(false);
			setSecondsRemaining(diff);

			const hours = Math.floor(diff / 3600);
			const minutes = Math.floor((diff % 3600) / 60);
			const seconds = diff % 60;
			setTimeRemaining(
				`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
			);

			// Call callback when time is reached
			if (diff === 0 && onReached) {
				onReached();
			}
		};

		calculateTime();
		const interval = setInterval(calculateTime, 1000);

		return () => clearInterval(interval);
	}, [targetTime, onReached, isActive]);

	return {
		timeRemaining,
		secondsRemaining,
		isExpired,
	};
}
