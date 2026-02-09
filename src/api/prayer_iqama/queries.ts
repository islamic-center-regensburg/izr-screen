import { toast } from "sonner";
import {
	type GetAllPrayerIqamasData,
	getAllPrayerIqamas,
	getPrayerIqamasForMosque,
} from "../gen";
import { PRAYER_IQAMA_QUERY_KEYS } from "./constants";

export const getPrayerIqamaForMosqueQueryOptions = (mosqueId: string) => {
	return {
		queryKey: PRAYER_IQAMA_QUERY_KEYS.byMosqueId(mosqueId),
		queryFn: async () => {
			const response = await getPrayerIqamasForMosque({
				path: { mosque_id: mosqueId },
			});
			if (response.error) {
				toast.error("Iqama-Zeiten konnten nicht abgerufen werden");
				console.log(response.error.detail);
			}
			return response.data;
		},
		enabled: !!mosqueId,
	};
};

export const getPrayerIqamaQueryOptions = (
	query: Partial<GetAllPrayerIqamasData["query"]>,
) => {
	return {
		queryKey: PRAYER_IQAMA_QUERY_KEYS.all(
			query as Partial<GetAllPrayerIqamasData>,
		),
		queryFn: async () => {
			const response = await getAllPrayerIqamas({
				query: query as GetAllPrayerIqamasData["query"],
			});
			if (response.error) {
				toast.error("Iqama-Zeiten konnten nicht abgerufen werden");
				console.log(response.error.detail);
			}
			return response.data;
		},
		enabled: !!query && Object.keys(query).length > 0,
	};
};
