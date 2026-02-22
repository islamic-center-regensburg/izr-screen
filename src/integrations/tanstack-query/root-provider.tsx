import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MosqueProvider } from "@/contexts/mosque-context";

export function getContext() {
	const queryClient = new QueryClient();
	const mosque_name = "Islamisches Zentrum Regensburg";
	return {
		queryClient,
		mosque_name,
	};
}

export function Provider({
	children,
	queryClient,
}: {
	children: React.ReactNode;
	queryClient: QueryClient;
}) {
	return (
		<QueryClientProvider client={queryClient}>
			<MosqueProvider mosque_name="Islamisches Zentrum Regensburg">
				{children}
			</MosqueProvider>
		</QueryClientProvider>
	);
}
