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
		<div className={`prayer-time${isBlink ? " animate-pulse" : ""}`}>
			<span className={isActive ? "prayer-time__label--active" : ""}>
				{IQAMA_ADHAN_NAME_MAPPING[label].de} /{" "}
				{IQAMA_ADHAN_NAME_MAPPING[label].ar}
			</span>
			<strong className={isActive ? "prayer-time__value--active" : ""}>
				{time || "-"}
			</strong>
		</div>
	);
}

export default PrayerTimeDisplay;
