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
			className={`mt-[1vh] flex flex-col items-center justify-center rounded-lg border p-[0.3vw] backdrop-blur-sm w-1/1 ${
				isActive
					? "border-white/10 bg-white/10"
					: "border-primary/10 bg-primary/5"
			}`}
		>
			<p
				className={`text-[1.2vw] font-bold ${
					isActive ? "text-white" : "text-primary"
				}`}
			>
				{label}
			</p>
			<p
				className={`text-[2vw] font-bold ${isActive ? "text-white" : "text-primary"}`}
			>
				{timeRemaining}
			</p>
		</div>
	);
}

export default PrayerTimer;
