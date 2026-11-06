import { afterEach, describe, expect, it, vi } from "vitest";
import {
	fetchScreenConfig,
	parseScreenConfig,
	SCREEN_CONFIG_URL,
	type ScreenConfig,
} from "@/api/screen-config";
import {
	buildDashboardUrl,
	canVisitDashboard,
	getConfigKey,
	isManualMode,
} from "./screen-control";

const config: ScreenConfig = {
	id: "screen",
	mode: "manual",
	manual_view: "prayer_times",
	dashboard_url: "https://iz-regensburg.de/dashboard?existing=value",
	dashboard_enabled: true,
	dashboard_interval_minutes: 15,
	dashboard_duration_seconds: 90,
	manual_expires_at: null,
	date_updated: "2026-11-06T12:00:00",
};

const prayerTimes = {
	fajr: "06:00:00",
	dhuhr: "12:00:00",
	asr: "15:00:00",
	maghrib: "17:00:00",
	isha: "19:00:00",
};

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("Directus config", () => {
	it("accepts the singleton config shape", () => {
		expect(parseScreenConfig(config)).toEqual(config);
	});

	it.each([
		{ mode: "invalid" },
		{ manual_view: "/arbitrary-route" },
		{ dashboard_url: "javascript:alert(1)" },
		{ dashboard_url: "/dashboard" },
		{ dashboard_enabled: "true" },
		{ dashboard_interval_minutes: 0 },
		{ dashboard_duration_seconds: -1 },
		{ dashboard_duration_seconds: 0.5 },
		{ manual_expires_at: "invalid" },
	])("rejects malformed configuration: %j", (overrides) => {
		expect(() => parseScreenConfig({ ...config, ...overrides })).toThrow();
	});

	it("fetches uncached public singleton data and passes the abort signal", async () => {
		const fetch = vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify({ data: config }), { status: 200 }),
			);
		vi.stubGlobal("fetch", fetch);
		const controller = new AbortController();
		expect(await fetchScreenConfig(controller.signal)).toEqual(config);
		expect(fetch).toHaveBeenCalledWith(SCREEN_CONFIG_URL, {
			cache: "no-store",
			signal: controller.signal,
		});
	});

	it("reports HTTP errors rather than applying a default config", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("", { status: 503 })),
		);
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		await expect(fetchScreenConfig()).rejects.toThrow("HTTP 503");
		expect(log).toHaveBeenCalledOnce();
	});
});

describe("manual overrides", () => {
	const now = Date.parse("2026-11-06T12:00:00Z");

	it("keeps manual mode active without expiry", () => {
		expect(isManualMode(config, now)).toBe(true);
	});

	it("resumes automatic mode at the expiry boundary", () => {
		const expiring = {
			...config,
			manual_expires_at: new Date(now).toISOString(),
		};
		expect(isManualMode(expiring, now - 1)).toBe(true);
		expect(isManualMode(expiring, now)).toBe(false);
		expect(isManualMode({ ...config, mode: "automatic" }, now)).toBe(false);
		expect(isManualMode(undefined, now)).toBe(false);
	});

	it("detects config changes, including date_updated for a repeated command", () => {
		expect(getConfigKey(config)).not.toBe(
			getConfigKey({ ...config, date_updated: "2026-11-06T12:01:00" }),
		);
	});
});

describe("dashboard navigation", () => {
	it("sets the exact dashboard parameters and preserves existing parameters", () => {
		const callback = "https://screen.example/?return=value";
		const url = new URL(buildDashboardUrl(config, callback, Date.now()));
		expect(url.origin + url.pathname).toBe(
			"https://iz-regensburg.de/dashboard",
		);
		expect(Object.fromEntries(url.searchParams)).toEqual({
			existing: "value",
			fullscreen: "true",
			callback,
			time: "90",
		});
	});

	it("returns no later than the manual override expiry", () => {
		const now = Date.now();
		const url = new URL(
			buildDashboardUrl(
				{ ...config, manual_expires_at: new Date(now + 12_000).toISOString() },
				"https://screen.example/",
				now,
			),
		);
		expect(url.searchParams.get("time")).toBe("12");
	});

	it("allows an automatic visit sufficiently far from the next prayer", () => {
		expect(
			canVisitDashboard(
				prayerTimes,
				"asr",
				"15:00",
				new Date(2026, 10, 6, 14),
				90,
			),
		).toBe(true);
	});

	it("blocks a visit that would overlap Adhan or its safety margin", () => {
		expect(
			canVisitDashboard(
				prayerTimes,
				"asr",
				"15:00",
				new Date(2026, 10, 6, 14, 57, 30),
				90,
			),
		).toBe(false);
	});

	it("blocks visits throughout the Adhan-to-Iqama window, including Friday", () => {
		expect(
			canVisitDashboard(
				prayerTimes,
				"jumah",
				"12:30",
				new Date(2026, 10, 6, 12, 5),
				90,
			),
		).toBe(false);
	});

	it("waits for the next prayer state to initialize during the day", () => {
		expect(
			canVisitDashboard(prayerTimes, null, null, new Date(2026, 10, 6, 12), 90),
		).toBe(false);
	});

	it("allows evening visits and protects the next morning's Fajr", () => {
		expect(
			canVisitDashboard(prayerTimes, null, null, new Date(2026, 10, 6, 22), 90),
		).toBe(true);
		expect(
			canVisitDashboard(
				{ ...prayerTimes, fajr: "00:01" },
				null,
				null,
				new Date(2026, 10, 6, 23, 59),
				90,
			),
		).toBe(false);
	});
});
