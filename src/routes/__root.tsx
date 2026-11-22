import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Bg from "@/components/bg";
import MockTimeDashboard from "@/components/mock-time-dashboard";
import { ScreenConfigProvider } from "@/contexts/screen-config-context";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import Provider from "../integrations/tanstack-query/root-provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({ links: [{ rel: "stylesheet", href: appCss }] }),
	shellComponent: ({ children }) => (
		<html lang="de">
			<head>
				<HeadContent />
			</head>
			<body>
				<Provider>{children}</Provider>
				<Scripts />
			</body>
		</html>
	),
	component: () => (
		<ScreenConfigProvider>
			<Bg>
				<Outlet />
			</Bg>

			<MockTimeDashboard />
			<TanStackDevtools
				config={{
					position: "bottom-left",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					TanStackQueryDevtools,
				]}
			/>
		</ScreenConfigProvider>
	),
});
