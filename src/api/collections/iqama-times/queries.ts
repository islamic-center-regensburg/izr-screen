import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { readItemsIqamaTimes } from "../../generated/sdk.gen";

export type { ItemsIqamaTimes as CmsIqama } from "../../generated/types.gen";

export const iqamaTimesKeys = {
	all: ["iqama-times"] as const,
};

const fetchIqamaTimes = createServerFn({ method: "GET" }).handler(async () => {
	const { data: body } = await readItemsIqamaTimes({
		query: { limit: -1, sort: ["id"] },
		throwOnError: true,
	});
	return body?.data ?? [];
});

export const iqamaTimesQueryOptions = () =>
	queryOptions({
		queryKey: iqamaTimesKeys.all,
		queryFn: () => fetchIqamaTimes(),
		refetchInterval: 60_000,
	});
