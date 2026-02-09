import { useQuery } from "@tanstack/react-query";
import type { PrayerName } from "@/api/gen";
import { getPrayerIqamaQueryOptions } from "@/api/prayer_iqama/queries";
import { PRAYER_NAME_MAPPING } from "../constants";

interface PrayerProps {
	prayerName: PrayerName;
	prayerTime?: string;
}

function Prayer({ prayerName, prayerTime }: PrayerProps) {
	const { data: prayerIqamaData } = useQuery(
		getPrayerIqamaQueryOptions({
			prayer_name: prayerName,
		}),
	);
	const prayer_iqama = prayerIqamaData?.data[0];
	prayer_iqama?.mode;
	const getIqamaTime = (): string | null => {
		if (!prayer_iqama) return null;

		if (prayer_iqama.mode === "fixed" && prayer_iqama?.fixed_time) {
			return prayer_iqama.fixed_time;
		}

		if (
			prayer_iqama.mode === "offset" &&
			prayerTime &&
			prayer_iqama.offset_minutes
		) {
			const [hours, minutes] = prayerTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + prayer_iqama.offset_minutes;
			const iqamaHours = Math.floor(totalMinutes / 60);
			const iqamaMinutes = totalMinutes % 60;
			return `${String(iqamaHours).padStart(2, "0")}:${String(iqamaMinutes).padStart(2, "0")}`;
		}

		return null;
	};

	const iqamaTime = getIqamaTime();

	return (
		<div className="flex h-full flex-col items-center justify-center gap-[1vh] rounded-4xl border border-muted p-[1.5vw] shadow-md">
			<div className="text-center">
				<h2 className="text-[2vw] font-semibold">
					{PRAYER_NAME_MAPPING[prayerName].de}
				</h2>
				<p className="text-[1.8vw] text-muted-foreground font-['Naveid']">
					{PRAYER_NAME_MAPPING[prayerName].ar}
				</p>
			</div>
			<div className="mt-[1vh] flex flex-col items-center gap-[0.5vh]">
				<p className="text-[1vw] text-muted-foreground">Gebetszeit</p>
				<p className="text-[2.5vw] font-bold">{prayerTime || "-"}</p>
			</div>
			{iqamaTime && (
				<div className="flex flex-col items-center gap-[0.5vh]">
					<p className="text-[1vw] text-muted-foreground">Iqama-Zeit</p>
					<p className="text-[2.5vw] font-bold text-primary">{iqamaTime}</p>
				</div>
			)}
		</div>
	);
}

export default Prayer;
