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
					toast.error(
						"Keine Moschee-Daten zurückgegeben. Bitte versuchen Sie es später erneut.",
					);
					throw new Error("Keine Moschee-Daten zurückgegeben");
				}
				return response.data;
			} catch (error) {
				console.error("Fehler beim Abrufen von Moscheen:", error);
				toast.error(
					"Moscheen konnten nicht abgerufen werden. Bitte versuchen Sie es später erneut.",
				);
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
					toast.error(
						"Keine Moschee-Daten zurückgegeben. Bitte versuchen Sie es später erneut.",
					);
					throw new Error("Keine Moschee-Daten zurückgegeben");
				}
				return response.data;
			} catch (error) {
				console.error(`Fehler beim Abrufen der Moschee mit ID ${id}:`, error);
				toast.error(
					"Moscheedetails konnten nicht abgerufen werden. Bitte versuchen Sie es später erneut.",
				);
				throw error;
			}
		},
	};
};
