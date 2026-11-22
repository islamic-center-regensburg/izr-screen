import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";
export function getRouter() {
	const context = getContext();
	const router = createRouter({
		routeTree,
		context,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultPendingMs: 200,
		defaultPendingMinMs: 400,
		scrollRestoration: true,
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient: context.queryClient,
		wrapQueryClient: false,
	});
	return router;
}
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
