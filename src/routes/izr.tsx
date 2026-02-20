import { createFileRoute } from "@tanstack/react-router";
import IZRPage from "@/pages/izr-page";

export const Route = createFileRoute("/izr")({
	component: IZRPage,
});
