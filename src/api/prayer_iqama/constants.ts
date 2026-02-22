import type { GetAllPrayerIqamasData } from "../gen";
import { buildQueryKey, buildQueryKeyWithPath } from "../utils/buildQueryKey";

const ROOT_QUERY_KEY: string = "prayer_iqama";
export const PRAYER_IQAMA_QUERY_KEYS = {
	root: ROOT_QUERY_KEY,
	all: (queryObj: Partial<GetAllPrayerIqamasData>) =>
		buildQueryKey(ROOT_QUERY_KEY, queryObj),
	byMosqueId: (id: string) =>
		buildQueryKeyWithPath(ROOT_QUERY_KEY, { path: "mosque_id", value: id }),
};
