export const SCREEN_CONFIG_URL =
	import.meta.env.VITE_SCREEN_CONFIG_URL ||
	"https://api.iz-regensburg.de/cms/public/items/izr_screen_cfg";

export const SCREEN_CONFIG_POLL_INTERVAL = 2_000;

export type ManualView = "prayer_times" | "izr" | "ramadan" | "dashboard";

export interface ScreenConfig {
	id: string;
	mode: "automatic" | "manual";
	manual_view: ManualView;
	dashboard_url: string;
	dashboard_enabled: boolean;
	dashboard_interval_minutes: number;
	dashboard_duration_seconds: number;
	manual_expires_at: string | null;
	date_updated: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
	return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function parseScreenConfig(value: unknown): ScreenConfig {
	if (!isRecord(value)) {
		throw new Error("Die Bildschirm-Konfiguration muss ein Objekt sein.");
	}

	const {
		id,
		mode,
		manual_view,
		dashboard_url,
		dashboard_enabled,
		dashboard_interval_minutes,
		dashboard_duration_seconds,
		manual_expires_at,
		date_updated,
	} = value;

	if (
		typeof id !== "string" ||
		(mode !== "automatic" && mode !== "manual") ||
		(manual_view !== "prayer_times" &&
			manual_view !== "izr" &&
			manual_view !== "ramadan" &&
			manual_view !== "dashboard") ||
		typeof dashboard_url !== "string" ||
		typeof dashboard_enabled !== "boolean" ||
		!isPositiveInteger(dashboard_interval_minutes) ||
		!isPositiveInteger(dashboard_duration_seconds) ||
		(manual_expires_at !== null &&
			(typeof manual_expires_at !== "string" ||
				!Number.isFinite(Date.parse(manual_expires_at)))) ||
		(date_updated !== null && typeof date_updated !== "string")
	) {
		throw new Error("Die Bildschirm-Konfiguration enthält ungültige Felder.");
	}

	const dashboardUrl = new URL(dashboard_url);
	if (!["https:", "http:"].includes(dashboardUrl.protocol)) {
		throw new Error("Die Dashboard-URL muss HTTP oder HTTPS verwenden.");
	}

	return {
		id,
		mode,
		manual_view,
		dashboard_url,
		dashboard_enabled,
		dashboard_interval_minutes,
		dashboard_duration_seconds,
		manual_expires_at,
		date_updated,
	};
}

export async function fetchScreenConfig(
	signal?: AbortSignal,
): Promise<ScreenConfig> {
	try {
		const response = await fetch(SCREEN_CONFIG_URL, {
			signal,
			cache: "no-store",
		});
		if (!response.ok) {
			throw new Error(`Bildschirm-Konfiguration: HTTP ${response.status}`);
		}

		const body: unknown = await response.json();
		if (!isRecord(body)) {
			throw new Error("Ungültige Antwort der Bildschirm-Konfiguration.");
		}
		return parseScreenConfig(body.data);
	} catch (error) {
		if (!signal?.aborted) {
			console.error(
				"Bildschirm-Konfiguration konnte nicht geladen werden:",
				error,
			);
		}
		throw error;
	}
}
