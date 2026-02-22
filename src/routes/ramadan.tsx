import { createFileRoute } from "@tanstack/react-router";
import RamadanPage from "@/pages/ramadan-page";

export const Route = createFileRoute("/ramadan")({
	component: RamadanPage,
});
