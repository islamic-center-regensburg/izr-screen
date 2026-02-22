import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/eid-mubarak")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/eid-mubarak"!</div>;
}
