import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";
import type { MosqueOut } from "@/api/gen";
import { getMosquesQueryOptions } from "@/api/mosque/queries";

interface MosqueContextValue {
	mosque: MosqueOut | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

const MosqueContext = createContext<MosqueContextValue | undefined>(undefined);

interface MosqueProviderProps {
	children: ReactNode;
	mosque_name: string;
}

export function MosqueProvider({ children, mosque_name }: MosqueProviderProps) {
	const {
		data: mosques,
		isLoading,
		error,
		refetch,
	} = useQuery(getMosquesQueryOptions({ query: { name: mosque_name } }));

	const mosque = mosques ? mosques.data[0] : undefined;
	return (
		<MosqueContext.Provider
			value={{ mosque, isLoading, error: error as Error | null, refetch }}
		>
			{children}
		</MosqueContext.Provider>
	);
}

export function useMosque() {
	const context = useContext(MosqueContext);
	if (context === undefined) {
		throw new Error("useMosque must be used within a MosqueProvider");
	}
	return context;
}
