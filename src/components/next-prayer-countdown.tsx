import type { PrayerName } from "@/api/gen";
import { useNextPrayer } from "@/contexts";
import { useTimer } from "@/hooks/useTimer";

const prayerLabels: Record<string, Record<PrayerName, string>> = {
	de: {
		fajr: "Fajr",
		dhuhr: "Dhuhr",
		jumah: "Jumuah",
		asr: "Asr",
		maghrib: "Maghrib",
		isha: "Isha",
	},
	en: {
		fajr: "Fajr",
		dhuhr: "Dhuhr",
		jumah: "Jumuah",
		asr: "Asr",
		maghrib: "Maghrib",
		isha: "Isha",
	},
	ar: {
		fajr: "الفجر",
		dhuhr: "الظهر",
		jumah: "الجمعة",
		asr: "العصر",
		maghrib: "المغرب",
		isha: "العشاء",
	},
};

const messages = {
	de: {
		label: "Zeit bis zum nächsten Gebet",
		unavailable: "Gebetszeit nicht verfügbar",
	},
	en: {
		label: "Time until next prayer",
		unavailable: "Prayer time unavailable",
	},
	ar: {
		label: "الوقت المتبقي للصلاة القادمة",
		unavailable: "موعد الصلاة غير متاح",
	},
};

export default function NextPrayerCountdown({
	language,
}: {
	language: string;
}) {
	const { nextPrayerName, nextPrayerTime, nextPrayerIsTomorrow } =
		useNextPrayer();
	const countdown = useTimer({
		targetTime: nextPrayerTime ?? "00:00",
		isActive: Boolean(nextPrayerName && nextPrayerTime),
		nextDay: nextPrayerIsTomorrow,
	});
	const locale = messages[language as keyof typeof messages] ? language : "de";

	return (
		<div className="next-prayer" aria-live="polite">
			<span className="next-prayer__label">
				{messages[locale as keyof typeof messages].label}
			</span>
			<strong className="next-prayer__name">
				{nextPrayerName
					? prayerLabels[locale as keyof typeof prayerLabels][nextPrayerName]
					: messages[locale as keyof typeof messages].unavailable}
			</strong>
			{nextPrayerName && nextPrayerTime && (
				<span
					className="next-prayer__remaining"
					role="timer"
					aria-label={messages[locale as keyof typeof messages].label}
				>
					{countdown.timeRemaining.replace(/^(00:)+/, "")}
				</span>
			)}
		</div>
	);
}
