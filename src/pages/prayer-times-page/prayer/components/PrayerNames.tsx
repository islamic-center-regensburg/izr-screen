import type { PrayerName } from "@/api/gen";
import { PRAYER_NAME_MAPPING } from "../../constants";

interface PrayerNameProps {
	prayerName: PrayerName;
	showArabic?: boolean;
	isActive?: boolean;
}

function PrayerNames({
	prayerName,
	showArabic = true,
	isActive = false,
}: PrayerNameProps) {
	return (
		<div className="text-center">
			<h2
				className={`text-[2.5vw] font-semibold ${isActive ? "text-white" : ""}`}
			>
				{PRAYER_NAME_MAPPING[prayerName].de}
			</h2>
			{showArabic && (
				<h2
					className={`text-[2.5vw] font-bold ${isActive ? "text-white" : ""}`}
				>
					{PRAYER_NAME_MAPPING[prayerName].ar}
				</h2>
			)}
		</div>
	);
}

export default PrayerNames;
