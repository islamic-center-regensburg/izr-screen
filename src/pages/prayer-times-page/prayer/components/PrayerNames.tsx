import type { PrayerName } from "@/api/gen";
import { PRAYER_NAME_MAPPING } from "../../constants";

interface PrayerNameProps {
	prayerName: PrayerName;
	showArabic?: boolean;
}

function PrayerNames({ prayerName, showArabic = true }: PrayerNameProps) {
	return (
		<div className="text-center">
			<h2 className="text-[2vw] font-semibold">
				{PRAYER_NAME_MAPPING[prayerName].de}
			</h2>
			{showArabic && (
				<p className="text-[1.8vw] text-muted-foreground font-['Naveid']">
					{PRAYER_NAME_MAPPING[prayerName].ar}
				</p>
			)}
		</div>
	);
}

export default PrayerNames;
