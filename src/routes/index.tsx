import { createFileRoute } from "@tanstack/react-router";
import { prayerTimesDetailQueryOptions as prayerTimesQueryOptions } from "@/api/collections/prayer-times/queries";
import { screenConfigQueryOptions as screenSettingsQueryOptions } from "@/api/collections/screen-config/queries";
import PrayerTimesPage from "@/pages/prayer-times-page/prayer-times-page";
import { calendarDate, nextCalendarDate } from "@/utils/calendar-date";

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
			const tomorrowDate = nextCalendarDate(date);
			const tomorrow = await context.queryClient
				.fetchQuery(prayerTimesQueryOptions(tomorrowDate))
				.catch((error: unknown) => {
					console.error(
						"Fehler beim Laden der Gebetszeiten für morgen:",
						error,
					);
					return undefined;
				});
			if (!tomorrow) {
				console.error(`Keine Gebetszeiten für ${tomorrowDate} verfügbar.`);
			}
			if (!row)
				return { prayerTimes: null, tomorrowPrayerTimes: null, settings };
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
					hijri_date: row.hijri ?? "",
				},
				tomorrowPrayerTimes: tomorrow
					? {
							fajr: tomorrow.fajr,
							shuruq: tomorrow.sunrise,
							dhuhr: tomorrow.dhuhr,
							jumah: tomorrow.jumuah ?? "",
							asr: tomorrow.asr,
							maghrib: tomorrow.maghrib,
							isha: tomorrow.isha,
							gregorian_date: tomorrow.date,
							hijri_date: tomorrow.hijri ?? "",
						}
					: null,
				settings,
			};
		} catch (error) {
			console.error("Fehler beim Laden der Gebetszeiten:", error);
			return {
				prayerTimes: null,
				tomorrowPrayerTimes: null,
				settings: undefined,
			};
		}
	},
	component: PrayerTimesPage,
});
