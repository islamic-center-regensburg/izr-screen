interface PrayerTimeDisplayProps {
	label: string;
	time: string | null;
	isBlink?: boolean;
	isActive?: boolean;
}

function PrayerTimeDisplay({
	label,
	time,
	isBlink = false,
	isActive = false,
}: PrayerTimeDisplayProps) {
	return (
		<div
			className={`flex flex-col items-center gap-[0.5vh] ${
				isBlink ? "animate-pulse" : ""
			}`}
		>
			<p
				className={`text-[1.5vw] ${isActive ? "text-white" : "text-muted-foreground"}`}
			>
				{label}
			</p>
			<p className={`text-[3.5vw] font-bold ${isActive ? "text-white" : ""}`}>
				{time || "-"}
			</p>
		</div>
	);
}

export default PrayerTimeDisplay;
