import { useQuery } from "@tanstack/react-query";
import type { PrayerName } from "@/api/gen";
import { iqamaQueryOptions, selectIqama } from "@/api/iqama";
import { nowTime } from "@/utils/time-utils";

export default function usePrayerIqama(prayerName: PrayerName) {
	const query = useQuery(iqamaQueryOptions());
	const item = selectIqama(query.data ?? [], prayerName, nowTime({}));
	return {
		...query,
		prayerIqama: item ? { ...item, mode: item.type } : undefined,
	};
}
