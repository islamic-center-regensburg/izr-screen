interface PrayerTimerProps {
	timeRemaining: string; // HH:MM:SS format
	label?: string;
	isBlink?: boolean;
	isActive?: boolean;
}

function PrayerTimer({
	timeRemaining,
	label = "Time Until",
	isActive = false,
}: PrayerTimerProps) {
	return (
		<div className={`prayer-timer${isActive ? " prayer-timer--active" : ""}`}>
			<span>{label}</span>
			<strong>{timeRemaining}</strong>
		</div>
	);
}

export default PrayerTimer;
