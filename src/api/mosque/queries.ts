import { toast } from "sonner";
import {
	type GetAllMosquesData,
	getAllMosques,
	getMosqueById,
	type MosqueOut,
	type PaginatedResponseMosqueOut,
} from "../gen";
import { MOSQUE_QUERY_KEYS } from "./constants";

export const getMosquesQueryOptions = ({
	query,
}: Partial<GetAllMosquesData> = {}) => {
	return {
		queryKey: MOSQUE_QUERY_KEYS.all({ query }),
		queryFn: async (): Promise<PaginatedResponseMosqueOut> => {
			try {
				const response = await getAllMosques(query ? { query } : undefined);
				if (!response.data) {
					toast.error("No mosques data returned. Please try again later.");
					throw new Error("No mosques data returned");
				}
				return response.data;
			} catch (error) {
				console.error("Error fetching mosques:", error);
				toast.error("Failed to fetch mosques. Please try again later.");
				throw error;
			}
		},
	};
};

export const getMosqueByIdQueryOptions = (id: string) => {
	return {
		queryKey: MOSQUE_QUERY_KEYS.byId(id),
		queryFn: async (): Promise<MosqueOut> => {
			try {
				const response = await getMosqueById({
					path: { mosque_id: id },
				});
				if (!response.data) {
					toast.error("No mosque data returned. Please try again later.");
					throw new Error("No mosque data returned");
				}
				return response.data;
			} catch (error) {
				console.error(`Error fetching mosque with id ${id}:`, error);
				toast.error("Failed to fetch mosque details. Please try again later.");
				throw error;
			}
		},
	};
};
