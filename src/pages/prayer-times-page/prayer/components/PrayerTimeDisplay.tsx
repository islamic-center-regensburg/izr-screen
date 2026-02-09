interface PrayerTimeDisplayProps {
	label: string;
	time: string | null;
	isBlink?: boolean;
}

function PrayerTimeDisplay({
	label,
	time,
	isBlink = false,
}: PrayerTimeDisplayProps) {
	return (
		<div
			className={`flex flex-col items-center gap-[0.5vh] ${
				isBlink ? "animate-pulse" : ""
			}`}
		>
			<p className="text-[1vw] text-muted-foreground">{label}</p>
			<p className="text-[2.5vw] font-bold">{time || "-"}</p>
		</div>
	);
}

export default PrayerTimeDisplay;
