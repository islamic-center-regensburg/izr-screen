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
		<div className={`prayer-name${isActive ? " prayer-name--active" : ""}`}>
			<h2>{PRAYER_NAME_MAPPING[prayerName].de}</h2>
			{showArabic && (
				<p className="prayer-name__arabic" lang="ar" dir="rtl">
					{PRAYER_NAME_MAPPING[prayerName].ar}
				</p>
			)}
		</div>
	);
}

export default PrayerNames;
