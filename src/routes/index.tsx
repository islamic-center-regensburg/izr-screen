import { createFileRoute } from "@tanstack/react-router";
import PrayerTimesPage from "@/pages/prayer-times-page/prayer-times-page";

export const Route = createFileRoute("/")({
	component: PrayerTimesPage,
});
