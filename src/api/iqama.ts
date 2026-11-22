import type { CmsIqama } from "./collections/iqama-times/queries";

export { iqamaTimesQueryOptions as iqamaQueryOptions } from "./collections/iqama-times/queries";

import type { PrayerName } from "./gen";

export function selectIqama(
	rows: CmsIqama[],
	prayer: PrayerName,
	date: Date,
): CmsIqama | undefined {
	const weekday = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	][date.getDay()];
	return rows.find(
		(row) =>
			row.prayer === (prayer === "jumah" ? "jumuah" : prayer) &&
			row.weekday === weekday,
	);
}
