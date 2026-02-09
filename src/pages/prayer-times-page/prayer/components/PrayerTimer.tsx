interface PrayerTimerProps {
	timeRemaining: string; // HH:MM:SS format
	label?: string;
	isBlink?: boolean;
}

function PrayerTimer({
	timeRemaining,
	label = "Time Until",
	isBlink = false,
}: PrayerTimerProps) {
	return (
		<div
			className={`mt-[1vh] flex flex-col items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm p-[0.8vw] ${
				isBlink ? "animate-pulse" : ""
			}`}
		>
			<p className="text-[0.8vw] font-semibold text-primary">{label}</p>
			<p className="text-[2vw] font-bold text-primary">{timeRemaining}</p>
		</div>
	);
}

export default PrayerTimer;
