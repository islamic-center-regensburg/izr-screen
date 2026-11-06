import type { ScreenConfig } from "@/api/screen-config";

export function isManualMode(config: ScreenConfig | undefined, now: number) {
	return (
		config?.mode === "manual" &&
		(config.manual_expires_at === null ||
			Date.parse(config.manual_expires_at) > now)
	);
}

export function getConfigKey(config: ScreenConfig): string {
	return JSON.stringify(config);
}

export function buildDashboardUrl(
	config: ScreenConfig,
	callback: string,
	now: number,
): string {
	const url = new URL(config.dashboard_url);
	let duration = config.dashboard_duration_seconds;
	if (isManualMode(config, now) && config.manual_expires_at) {
		duration = Math.min(
			duration,
			Math.max(
				1,
				Math.ceil((Date.parse(config.manual_expires_at) - now) / 1000),
			),
		);
	}
	url.searchParams.set("fullscreen", "true");
	url.searchParams.set("callback", callback);
	url.searchParams.set("time", String(duration));
	return url.toString();
}

export function canVisitDashboard(
	prayerTimes: Record<string, string>,
	nextPrayerName: string | null,
	nextPrayerTime: string | null,
	now: Date,
	durationSeconds: number,
): boolean {
	const seconds =
		now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
	const toSeconds = (time: string) => {
		const [hours, minutes, seconds = 0] = time.split(":").map(Number);
		return hours * 3600 + minutes * 60 + seconds;
	};
	const adhan = nextPrayerName
		? (prayerTimes[nextPrayerName] ??
			(nextPrayerName === "jumah" ? prayerTimes.dhuhr : undefined))
		: undefined;

	if (
		!nextPrayerName &&
		(!prayerTimes.isha || seconds <= toSeconds(prayerTimes.isha))
	) {
		return false;
	}

	// The active prayer stays selected between Adhan and Iqama.
	if (adhan && toSeconds(adhan) <= seconds) return false;

	const protectedTimes = [nextPrayerTime, prayerTimes.fajr].filter(
		(time): time is string => !!time,
	);
	return protectedTimes.every((time) => {
		const target = toSeconds(time);
		if (!Number.isFinite(target)) return false;
		const remaining = (target - seconds + 86400) % 86400;
		return remaining > durationSeconds + 60;
	});
}
