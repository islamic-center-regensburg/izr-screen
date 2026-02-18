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
		<div
			className={`mt-[1vh] flex flex-col items-center justify-center rounded-lg p-[0.8vw]`}
		>
			<p
				className={`text-[1vw] font-semibold ${
					isActive ? "text-white" : "text-primary"
				}`}
			>
				{label}
			</p>
			<p
				className={`text-[3vw] font-bold ${isActive ? "text-white" : "text-primary"}`}
			>
				{timeRemaining}
			</p>
		</div>
	);
}

export default PrayerTimer;
