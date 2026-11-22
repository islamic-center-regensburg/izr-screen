import type { CmsIqama } from "@/api/collections/iqama-times/queries";
import type { PrayerName } from "@/api/gen";
import { nowTime } from "@/utils/time-utils";

export function displayIqamas(
	rows: CmsIqama[],
	prayer: PrayerName,
	adhan?: string,
): string[] {
	const weekday =
		prayer === "jumah"
			? "friday"
			: [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				][nowTime({}).getDay()];
	const times = rows
		.filter(
			(row) =>
				row.prayer === (prayer === "jumah" ? "jumuah" : prayer) &&
				row.weekday === weekday,
		)
		.flatMap((row) => {
			if (row.type === "fixed" && row.fixed_time)
				return [row.fixed_time.slice(0, 5)];
			if (row.type === "offset" && row.offset_minutes != null && adhan) {
				const [hours, minutes] = adhan.split(":").map(Number);
				const total = (hours * 60 + minutes + row.offset_minutes + 1440) % 1440;
				return [
					`${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`,
				];
			}
			return [];
		});
	return prayer === "jumah" ? times.sort() : times;
}
