import { toast } from "sonner";
import {
	type GetPrayerTimesData,
	type GetPrayerTimesForMosqueData,
	getPrayerTimes,
	getPrayerTimesForMosque,
	type PrayerTimesOut,
} from "../gen";
import { PRAYER_TIMES_QUERY_KEYS } from "./constants";

export const getPrayerTimesQueryOptions = ({
	query,
}: Partial<GetPrayerTimesData>) => {
	return {
		queryKey: PRAYER_TIMES_QUERY_KEYS.all({ query }),
		queryFn: async (): Promise<PrayerTimesOut[]> => {
			try {
				const response = await getPrayerTimes({
					query: query as GetPrayerTimesData["query"],
				});
				if (!response.data) {
					toast.error("No prayer times data returned. Please try again later.");
					throw new Error("No prayer times data returned");
				}
				return response.data;
			} catch (error) {
				console.error("Error fetching prayer times:", error);
				toast.error("Failed to fetch prayer times. Please try again later.");
				throw error;
			}
		},
	};
};

interface GetPrayerTimesForMosqueQueryOptionsInterface {
	query: GetPrayerTimesForMosqueData["query"];
	mosque_id: string;
}

export const getPrayerTimesForMosqueQueryOptions = ({
	query,
	mosque_id,
}: GetPrayerTimesForMosqueQueryOptionsInterface) => {
	return {
		queryKey: PRAYER_TIMES_QUERY_KEYS.forMosque(
			mosque_id,
			query ? { query } : undefined,
		),
		queryFn: async (): Promise<PrayerTimesOut[]> => {
			try {
				const response = await getPrayerTimesForMosque({
					query: query,
					path: { mosque_id },
				});
				if (!response.data) {
					toast.error("No prayer times data returned. Please try again later.");
					throw new Error("No prayer times data returned");
				}
				return response.data;
			} catch (error) {
				console.error("Error fetching prayer times:", error);
				toast.error("Failed to fetch prayer times. Please try again later.");
				throw error;
			}
		},
		enabled: Boolean(mosque_id),
	};
};
