import { createFileRoute } from "@tanstack/react-router";
import NoPhonePage from "@/pages/no-phone-page";

export const Route = createFileRoute("/no-phone/$countdown")({
	component: NoPhonePage,
});
