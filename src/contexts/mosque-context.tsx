import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { MosqueOut, PaginatedResponseMosqueOut } from "@/api/gen";
import { getAllMosques } from "@/api/gen";

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
	const [mosques, setMosques] = useState<PaginatedResponseMosqueOut | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchMosques = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await getAllMosques({ query: { name: mosque_name } });
			if (!response.data) {
				throw new Error("Keine Moschee-Daten zurückgegeben");
			}
			setMosques(response.data);
		} catch (fetchError) {
			setError(fetchError as Error);
			setMosques(null);
		} finally {
			setIsLoading(false);
		}
	}, [mosque_name]);

	useEffect(() => {
		void fetchMosques();
	}, [fetchMosques]);

	const mosque = useMemo(() => {
		return mosques?.data[0];
	}, [mosques]);

	const refetch = useCallback(() => {
		void fetchMosques();
	}, [fetchMosques]);
	return (
		<MosqueContext.Provider value={{ mosque, isLoading, error, refetch }}>
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
