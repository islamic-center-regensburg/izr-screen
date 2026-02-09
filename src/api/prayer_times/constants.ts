import type { GetPrayerTimesData, GetPrayerTimesForMosqueData } from "../gen";
import { buildQueryKey, buildQueryKeyWithPath } from "../utils/buildQueryKey";

const ROOT_QUERY_KEY: string = "prayer_times";
export const PRAYER_TIMES_QUERY_KEYS = {
	root: ROOT_QUERY_KEY,
	all: ({ query }: Partial<GetPrayerTimesData>) =>
		buildQueryKey(ROOT_QUERY_KEY, query),
	forMosque: (id: string, query?: Partial<GetPrayerTimesForMosqueData>) =>
		buildQueryKeyWithPath(
			ROOT_QUERY_KEY,
			{ path: "mosque_id", value: id },
			query,
		),
};
