import { createFileRoute } from "@tanstack/react-router";
import { prayerTimesDetailQueryOptions as prayerTimesQueryOptions } from "@/api/collections/prayer-times/queries";
import { screenConfigQueryOptions as screenSettingsQueryOptions } from "@/api/collections/screen-config/queries";
import PrayerTimesPage from "@/pages/prayer-times-page/prayer-times-page";
import { calendarDate } from "@/utils/calendar-date";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		try {
			const settings = await context.queryClient.fetchQuery(
				screenSettingsQueryOptions(),
			);
			const date = calendarDate(settings?.timezone || "Europe/Berlin");
			const row = await context.queryClient.fetchQuery(
				prayerTimesQueryOptions(date),
			);
			if (!row) return { prayerTimes: null, settings };
			return {
				prayerTimes: {
					fajr: row.fajr,
					shuruq: row.sunrise,
					dhuhr: row.dhuhr,
					jumah: row.jumuah ?? "",
					asr: row.asr,
					maghrib: row.maghrib,
					isha: row.isha,
					gregorian_date: row.date,
					hijri_date: row.hijri,
				},
				settings,
			};
		} catch (error) {
			console.error("Fehler beim Laden der Gebetszeiten:", error);
			return { prayerTimes: null, settings: undefined };
		}
	},
	component: PrayerTimesPage,
});
