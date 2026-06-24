import { IQAMA_ADHAN_NAME_MAPPING } from "../../constants";

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
				className={`text-[1.2vw] ${isActive ? "text-white" : "text-muted-foreground"}`}
			>
				{IQAMA_ADHAN_NAME_MAPPING[label].de} /{" "}
				{IQAMA_ADHAN_NAME_MAPPING[label].ar}
			</p>
			<p className={`text-[3vw] font-bold ${isActive ? "text-white" : ""}`}>
				{time || "-"}
			</p>
		</div>
	);
}

export default PrayerTimeDisplay;
