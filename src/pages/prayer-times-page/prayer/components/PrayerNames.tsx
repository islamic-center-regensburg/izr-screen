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
				className={`text-[4vw] font-semibold ${isActive ? "text-white" : ""}`}
			>
				{PRAYER_NAME_MAPPING[prayerName].de}
			</h2>
			{showArabic && (
				<p
					className={`text-[3vw] font-['Naveid'] ${
						isActive ? "text-white" : "text-muted-foreground"
					}`}
				>
					{PRAYER_NAME_MAPPING[prayerName].ar}
				</p>
			)}
		</div>
	);
}

export default PrayerNames;
