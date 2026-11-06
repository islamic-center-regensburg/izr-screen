import { useEffect } from "react";
import { useNextPrayer } from "@/contexts";
import { useScreenConfig } from "@/contexts/screen-config-context";
import { canVisitDashboard } from "@/lib/screen-control";
import { nowTime } from "@/utils/time-utils";

export default function AutomaticDashboard({
	prayerTimes,
}: {
	prayerTimes: Record<string, string> | null;
}) {
	const { config, isManual, now, lastDashboardAt, openDashboard } =
		useScreenConfig();
	const { nextPrayerName, nextPrayerTime } = useNextPrayer();

	useEffect(() => {
		if (
			!config?.dashboard_enabled ||
			isManual ||
			!prayerTimes ||
			now - lastDashboardAt < config.dashboard_interval_minutes * 60_000
		) {
			return;
		}
		if (
			canVisitDashboard(
				prayerTimes,
				nextPrayerName,
				nextPrayerTime,
				nowTime({}),
				config.dashboard_duration_seconds,
			)
		) {
			openDashboard();
		}
	}, [
		config,
		isManual,
		now,
		lastDashboardAt,
		nextPrayerName,
		nextPrayerTime,
		openDashboard,
		prayerTimes,
	]);

	return null;
}
