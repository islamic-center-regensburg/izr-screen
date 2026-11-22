import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { readSingleItemsPrayerTimes } from "../../generated/sdk.gen";

export const prayerTimesKeys = {
	all: ["prayer-times"] as const,
	detail: (date: string) => [...prayerTimesKeys.all, "detail", date] as const,
};

const fetchPrayerTimesDetail = createServerFn({ method: "GET" })
	.inputValidator((date: string) => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");
		return date;
	})
	.handler(async ({ data: date }) => {
		const { data: body } = await readSingleItemsPrayerTimes({
			path: { id: date },
			throwOnError: true,
		});
		return body?.data;
	});

export const prayerTimesDetailQueryOptions = (date: string) =>
	queryOptions({
		queryKey: prayerTimesKeys.detail(date),
		queryFn: () => fetchPrayerTimesDetail({ data: date }),
		enabled: Boolean(date),
	});
