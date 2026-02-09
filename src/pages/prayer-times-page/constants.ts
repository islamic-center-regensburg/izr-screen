import type { PrayerName } from "@/api/gen";

export const PRAYER_NAME_MAPPING: Record<
	PrayerName,
	{ de: string; ar: string }
> = {
	fajr: { de: "Fajr", ar: "الفجر" },
	dhuhr: { de: "Dhuhr", ar: "الظهر" },
	asr: { de: "Asr", ar: "العصر" },
	maghrib: { de: "Maghrib", ar: "المغرب" },
	isha: { de: "Isha", ar: "العشاء" },
	jumah: { de: "Jumah", ar: "الجمعة" },
};
