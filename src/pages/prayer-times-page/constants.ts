import type { PrayerName } from "@/api/gen";

export const PRAYER_NAME_MAPPING: Record<
	PrayerName,
	{ de: string; ar: string }
> = {
	fajr: { de: "Fajr", ar: "الفجــــر" },
	dhuhr: { de: "Dhuhr", ar: "الظهــــر" },
	asr: { de: "Asr", ar: "العصــــر" },
	maghrib: { de: "Maghrib", ar: "المغــــرب" },
	isha: { de: "Isha", ar: "العشــــاء" },
	jumah: { de: "Jumah", ar: "الجمعــــة" },
};
export const IQAMA_ADHAN_NAME_MAPPING: Record<
	string,
	{ de: string; ar: string }
> = {
	adhan: { de: "Adhan", ar: "الأذان" },
	iqama: { de: "Iqama", ar: "الإقــامـة" },
};
