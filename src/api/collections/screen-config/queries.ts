import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { readItemsScreenConfig } from "../../generated/sdk.gen";

export const screenConfigKeys = {
	all: ["cms-screen-settings"] as const,
};

const fetchScreenConfig = createServerFn({ method: "GET" }).handler(
	async () => {
		const { data: body } = await readItemsScreenConfig({ throwOnError: true });
		return body?.data;
	},
);

export const screenConfigQueryOptions = () =>
	queryOptions({
		queryKey: screenConfigKeys.all,
		queryFn: () => fetchScreenConfig(),
	});
