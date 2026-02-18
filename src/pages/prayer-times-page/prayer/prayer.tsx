import type { PrayerName } from "@/api/gen";
import usePrayerIqama from "@/hooks/usePrayerIqama";
import { PRAYER_NAME_MAPPING } from "../constants";

interface PrayerProps {
	prayerName: PrayerName;
	prayerTime?: string;
}

function Prayer({ prayerName, prayerTime }: PrayerProps) {
	const { prayerIqama } = usePrayerIqama(prayerName);
	const getIqamaTime = (): string | null => {
		if (!prayerIqama) return null;

		if (prayerIqama.mode === "fixed" && prayerIqama?.fixed_time) {
			return prayerIqama.fixed_time;
		}

		if (
			prayerIqama.mode === "offset" &&
			prayerTime &&
			prayerIqama.offset_minutes
		) {
			const [hours, minutes] = prayerTime.split(":").map(Number);
			const totalMinutes = hours * 60 + minutes + prayerIqama.offset_minutes;
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
				<p className="text-[1vw] text-muted-foreground">Adhan</p>
				<p className="text-[2.5vw] font-bold">{prayerTime || "-"}</p>
			</div>
			{iqamaTime && (
				<div className="flex flex-col items-center gap-[0.5vh]">
					<p className="text-[1vw] text-muted-foreground">Iqama</p>
					<p className="text-[2.5vw] font-bold text-primary">{iqamaTime}</p>
				</div>
			)}
		</div>
	);
}

export default Prayer;
