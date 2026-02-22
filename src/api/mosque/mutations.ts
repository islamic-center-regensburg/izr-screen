import { useQueryClient } from "@tanstack/react-query";
import {
	addMosque,
	type MosqueIn,
	type MosqueUpdate,
	updateMosque,
} from "../gen";
import type { MutationCallbackOptions } from "../utils/types";
import { MOSQUE_QUERY_KEYS } from "./constants";

export const createMosqueMutationOptions = ({
	onSuccess,
	onError,
}: MutationCallbackOptions) => {
	const queryClient = useQueryClient();
	return {
		mutationFn: async (mosque_in: MosqueIn) => {
			const response = await addMosque({ body: mosque_in });
			return response.data;
		},
		onSuccess: () => {
			if (onSuccess) onSuccess();
		},
		onError: (error: unknown) => {
			console.error("Error creating mosque:", error);
			if (onError) onError(error);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: [MOSQUE_QUERY_KEYS.root] });
		},
	};
};

interface updateMosqueMutationInterface {
	id: string;
	body: MosqueUpdate;
}
export const updateMosqueMutationOptions = ({
	onSuccess,
	onError,
}: MutationCallbackOptions) => {
	const queryClient = useQueryClient();
	return {
		mutationFn: async ({ id, body }: updateMosqueMutationInterface) => {
			const response = await updateMosque({
				body: body,
				path: { mosque_id: id },
			});
			return response.data;
		},
		onSuccess: () => {
			if (onSuccess) onSuccess();
		},
		onError: (error: unknown) => {
			console.error("Error updating mosque:", error);
			if (onError) onError(error);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: [MOSQUE_QUERY_KEYS.root] });
		},
	};
};
