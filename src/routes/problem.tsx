import { createFileRoute } from "@tanstack/react-router";
import ProblemPage from "@/pages/problem-page/problem-page";

export const Route = createFileRoute("/problem")({
	component: ProblemPage,
});
