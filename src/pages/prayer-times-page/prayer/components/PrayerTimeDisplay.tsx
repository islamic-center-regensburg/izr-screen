import { IQAMA_ADHAN_NAME_MAPPING } from "../../constants";

interface PrayerTimeDisplayProps {
	label: string;
	time: string | null;
	isBlink?: boolean;
	isActive?: boolean;
	jumuahNumber?: number;
}

function PrayerTimeDisplay({
	label,
	time,
	isActive = false,
	jumuahNumber,
}: PrayerTimeDisplayProps) {
	return (
		<div className="prayer-time">
			<span className={isActive ? "prayer-time__label--active" : ""}>
				{jumuahNumber ? (
					`Jumuah ${jumuahNumber} / الجمعة ${jumuahNumber}`
				) : (
					<>
						{IQAMA_ADHAN_NAME_MAPPING[label].de} /{" "}
						{IQAMA_ADHAN_NAME_MAPPING[label].ar}
					</>
				)}
			</span>
			<strong className={isActive ? "prayer-time__value--active" : ""}>
				{time || "-"}
			</strong>
		</div>
	);
}

export default PrayerTimeDisplay;
