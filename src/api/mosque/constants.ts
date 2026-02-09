import type { GetAllMosquesData } from "../gen";
import { buildQueryKey, buildQueryKeyWithPath } from "../utils/buildQueryKey";

const ROOT_QUERY_KEY: string = "mosques";
export const MOSQUE_QUERY_KEYS = {
	root: ROOT_QUERY_KEY,
	all: ({ query }: Partial<GetAllMosquesData>) =>
		buildQueryKey(ROOT_QUERY_KEY, query),
	byId: (id: string) =>
		buildQueryKeyWithPath(ROOT_QUERY_KEY, { path: "mosque_id", value: id }),
};
