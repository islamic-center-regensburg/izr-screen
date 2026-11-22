import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

type Context = {
	queryClient: QueryClient;
};

let clientContext: Context | undefined;

function createContext(): Context {
	return { queryClient: new QueryClient() };
}

export function getContext(): Context {
	// Keep server caches request-local and reuse the browser's cache.
	if (typeof document === "undefined") return createContext();
	if (!clientContext) clientContext = createContext();
	return clientContext;
}

export default function TanStackQueryProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { queryClient } = getContext();
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
