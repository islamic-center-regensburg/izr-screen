import { createFileRoute } from "@tanstack/react-router";
import { getMosquesQueryOptions } from "@/api/mosque/queries";
import { getPrayerTimesForMosqueQueryOptions } from "@/api/prayer_times/queries";
import PrayerTimesPage from "@/pages/prayer-times-page/prayer-times-page";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		try {
			// Zuerst die Moschee-Daten abrufen, um die mosque_id zu erhalten
			const mosqueQueryOptions = getMosquesQueryOptions({
				query: { name: "Islamisches Zentrum Regensburg" },
			});
			const mosqueData =
				await context.queryClient.fetchQuery(mosqueQueryOptions);
			const mosque_id = mosqueData?.data?.[0]?.id;

			if (!mosque_id) {
				console.error("Moschee nicht gefunden");
				return { prayerTimes: null };
			}

			// Gebetszeiten für heute abrufen
			const prayerTimesQueryOptions = getPrayerTimesForMosqueQueryOptions({
				mosque_id,
				query: {
					year: new Date().getFullYear(),
					month: new Date().getMonth() + 1,
					day: new Date().getDate(),
					source: "stored",
				},
			});
			const prayerTimesData = await context.queryClient.fetchQuery(
				prayerTimesQueryOptions,
			);
			return { prayerTimes: prayerTimesData ? prayerTimesData[0] : null };
		} catch (error) {
			console.error("Fehler beim Laden der Gebetszeiten:", error);
			return { prayerTimes: null };
		}
	},
	component: PrayerTimesPage,
});
