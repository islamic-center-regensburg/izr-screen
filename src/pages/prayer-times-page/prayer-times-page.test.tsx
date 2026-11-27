// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NextPrayerCountdown from "@/components/next-prayer-countdown";
import { setDisplayTimezone } from "@/utils/time-utils";
import PrayerTimesPage from "./prayer-times-page";

const state = vi.hoisted(() => ({
	invalidate: vi.fn(),
	settings: {} as Record<string, any>,
	prayerTimes: null as Record<string, string> | null,
	prayer: {
		nextPrayerName: null as string | null,
		nextPrayerTime: null as string | null,
		nextPrayerIsTomorrow: false,
	},
}));
vi.mock("@tanstack/react-router", () => ({
	useRouter: () => state,
	useLoaderData: () => ({
		prayerTimes: state.prayerTimes,
		settings: state.settings,
	}),
	useNavigate: () => vi.fn(),
}));
vi.mock("@/contexts", () => ({
	NextPrayerProvider: ({ children }: { children: React.ReactNode }) => children,
	useNextPrayer: () => state.prayer,
}));
vi.mock("@/components/automatic-dashboard", () => ({ default: () => null }));
vi.mock("@/components/screen-content", () => ({
	default: ({
		type,
		itemIndex,
		language,
	}: {
		type: string;
		itemIndex: number;
		language: string;
	}) => (
		<div data-testid="playlist-item" lang={language}>
			{type}:{itemIndex}
		</div>
	),
}));
vi.mock("./prayer-times-grid", () => ({ default: () => null }));
vi.mock("./header", () => ({ default: () => null }));
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-03-28T22:59:58Z"));
	state.invalidate.mockReset();
	sessionStorage.clear();
	state.settings = {
		mode: "automatic",
		timezone: "Europe/Berlin",
		refresh_interval_seconds: 3600,
		languages: ["en", "ar", "de"],
	};
	state.prayerTimes = null;
	state.prayer = {
		nextPrayerName: null,
		nextPrayerTime: null,
		nextPrayerIsTomorrow: false,
	};
});

it.each([
	["2026-03-28T11:55:00Z", "01:05:00", "01:04:59"],
	["2026-03-28T12:55:00Z", "05:00", "04:59"],
	["2026-03-28T12:59:51Z", "09", "08"],
])(
	"omits unused leading time units in the next-prayer countdown at %s",
	(now, expected, afterSecond) => {
		vi.setSystemTime(new Date(now));
		setDisplayTimezone("UTC");
		state.prayer = {
			nextPrayerName: "dhuhr",
			nextPrayerTime: "13:00",
			nextPrayerIsTomorrow: false,
		};
		render(<NextPrayerCountdown language="ar" />);
		expect(
			screen.getByLabelText("الوقت المتبقي للصلاة القادمة").textContent,
		).toBe(expected);
		act(() => vi.advanceTimersByTime(1000));
		expect(
			screen.getByLabelText("الوقت المتبقي للصلاة القادمة").textContent,
		).toBe(afterSecond);
	},
);

it("interrupts the playlist only when tomorrow's Fajr is within five minutes", () => {
	vi.setSystemTime(new Date("2026-03-28T23:54:00Z"));
	const client = new QueryClient({
		defaultOptions: { queries: { enabled: false, retry: false } },
	});
	client.setQueryData(
		["cms-screen-sections"],
		[{ id: "1", type: "news", enabled: true, sort: 1, duration_seconds: 30 }],
	);
	state.settings = { ...state.settings, timezone: "UTC" };
	state.prayerTimes = {
		fajr: "06:00",
		shuruq: "07:00",
		dhuhr: "12:00",
		jumah: "",
		asr: "15:00",
		maghrib: "18:00",
		isha: "20:00",
		gregorian_date: "2026-03-28",
		hijri_date: "1447-10-10",
	};
	state.prayer = {
		nextPrayerName: "fajr",
		nextPrayerTime: "00:01",
		nextPrayerIsTomorrow: true,
	};
	render(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	expect(screen.getByTestId("playlist-item")).toBeTruthy();
	vi.setSystemTime(new Date("2026-03-28T23:56:00Z"));
	act(() => vi.advanceTimersByTime(1000));
	expect(screen.queryByTestId("playlist-item")).toBeNull();
});

it("keeps the selected section and language fixed in manual mode, cycles items, and resumes automatic state", () => {
	const client = new QueryClient({
		defaultOptions: { queries: { enabled: false, retry: false } },
	});
	client.setQueryData(
		["cms-screen-sections"],
		[
			{
				id: "1",
				type: "news",
				enabled: true,
				sort: 1,
				duration_seconds: 1,
				max_items: 1,
			},
			{
				id: "2",
				type: "events",
				enabled: false,
				sort: 2,
				duration_seconds: 2,
				max_items: 4,
				visible_from: "2099-01-01T00:00:00Z",
			},
		],
	);
	client.setQueryData(["cms-screen-content", "news", 1], {
		items: [{ id: 1 }],
	});
	client.setQueryData(["cms-screen-content", "events", 4], {
		items: [{ id: 2 }, { id: 3 }],
	});
	state.settings = {
		mode: "manual",
		manual_section: "2",
		manual_language: "ar",
		timezone: "Europe/Berlin",
		refresh_interval_seconds: 3600,
		languages: ["en", "ar", "de"],
	};
	const view = render(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	expect(screen.getByTestId("playlist-item").textContent).toBe("events:0");
	expect(screen.getByTestId("playlist-item").getAttribute("lang")).toBe("ar");
	act(() => vi.advanceTimersByTime(1000));
	act(() => vi.advanceTimersByTime(1000));
	expect(screen.getByTestId("playlist-item").textContent).toBe("events:1");
	expect(screen.getByTestId("playlist-item").getAttribute("lang")).toBe("ar");
	act(() => vi.advanceTimersByTime(1000));
	act(() => vi.advanceTimersByTime(1000));
	expect(screen.getByTestId("playlist-item").textContent).toBe("events:0");
	state.settings = { ...state.settings, mode: "automatic" };
	client.setQueryData(["cms-screen-settings"], state.settings);
	view.rerender(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	expect(screen.getByTestId("playlist-item").textContent).toBe("news:0");
	expect(screen.getByTestId("playlist-item").getAttribute("lang")).toBe("en");
});

it("pauses manual item timing for prayer interruption and reports a deleted selection", () => {
	vi.setSystemTime(new Date("2026-03-28T21:59:58Z"));
	const client = new QueryClient({
		defaultOptions: { queries: { enabled: false, retry: false } },
	});
	client.setQueryData(
		["cms-screen-sections"],
		[
			{
				id: "2",
				type: "events",
				enabled: false,
				sort: 2,
				duration_seconds: 2,
				max_items: 2,
			},
		],
	);
	client.setQueryData(["cms-screen-content", "events", 2], {
		items: [{ id: 1 }, { id: 2 }],
	});
	state.settings = {
		mode: "manual",
		manual_section: "2",
		manual_language: "en",
		timezone: "Europe/Berlin",
		refresh_interval_seconds: 3600,
		languages: ["en", "ar", "de"],
	};
	state.prayerTimes = {
		fajr: "22:58",
		shuruq: "06:00",
		dhuhr: "12:00",
		jumah: "",
		asr: "15:00",
		maghrib: "18:00",
		isha: "20:00",
		gregorian_date: "2026-03-28",
		hijri_date: "1447-10-10",
	};
	state.prayer = {
		nextPrayerName: "fajr",
		nextPrayerTime: "23:00",
		nextPrayerIsTomorrow: false,
	};
	const view = render(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	act(() => vi.advanceTimersByTime(1000));
	expect(screen.queryByTestId("playlist-item")).toBeNull();
	state.prayer = {
		nextPrayerName: null,
		nextPrayerTime: null,
		nextPrayerIsTomorrow: false,
	};
	view.rerender(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	expect(screen.getByTestId("playlist-item").textContent).toBe("events:0");
	act(() => vi.advanceTimersByTime(1000));
	expect(screen.getByTestId("playlist-item").textContent).toBe("events:0");
	act(() => vi.advanceTimersByTime(1000));
	expect(screen.getByTestId("playlist-item").textContent).toBe("events:1");
	state.settings = { ...state.settings, manual_section: "99" };
	client.setQueryData(["cms-screen-settings"], state.settings);
	view.rerender(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	expect(screen.getByRole("alert").textContent).toContain(
		"ausgewählte Abschnitt fehlt",
	);
});

it("cycles through each content item for its configured duration before switching sections", () => {
	const client = new QueryClient({
		defaultOptions: { queries: { enabled: false, retry: false } },
	});
	client.setQueryData(
		["cms-screen-sections"],
		[
			{
				id: "1",
				type: "news",
				enabled: true,
				sort: 1,
				duration_seconds: 2,
				max_items: 2,
			},
			{
				id: "2",
				type: "events",
				enabled: true,
				sort: 2,
				duration_seconds: 1,
				max_items: 1,
			},
			{
				id: "3",
				type: "campaign_progress",
				enabled: true,
				sort: 3,
				duration_seconds: 2,
				max_items: 1,
			},
		],
	);
	client.setQueryData(["cms-screen-content", "news", 2], {
		items: [{ id: 1 }, { id: 2 }],
	});
	client.setQueryData(["cms-screen-content", "events", 1], {
		items: [{ id: 3 }],
	});
	client.setQueryData(["cms-screen-content", "campaign_progress", 1], {
		items: [{ id: 4 }],
	});
	render(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	const expected = [
		"news:0",
		"news:0",
		"news:1",
		"news:1",
		"events:0",
		"campaign_progress:0",
		"campaign_progress:0",
	];
	for (const language of ["en", "ar", "de", "en"]) {
		for (const item of expected) {
			expect(screen.getByTestId("playlist-item").textContent).toBe(item);
			expect(screen.getByTestId("playlist-item").getAttribute("lang")).toBe(
				language,
			);
			act(() => vi.advanceTimersByTime(1000));
		}
	}
});

it("gives every news item fifteen seconds in each playlist language", () => {
	const client = new QueryClient({
		defaultOptions: { queries: { enabled: false, retry: false } },
	});
	client.setQueryData(
		["cms-screen-sections"],
		[
			{
				id: "1",
				type: "news",
				enabled: true,
				sort: 1,
				duration_seconds: 15,
				max_items: 2,
			},
		],
	);
	client.setQueryData(["cms-screen-content", "news", 2], {
		items: [{ id: 1 }, { id: 2 }],
	});
	render(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	for (const language of ["en", "ar", "de"]) {
		for (const itemIndex of [0, 1]) {
			for (let second = 0; second < 15; second++) {
				expect(screen.getByTestId("playlist-item").textContent).toBe(
					`news:${itemIndex}`,
				);
				expect(screen.getByTestId("playlist-item").getAttribute("lang")).toBe(
					language,
				);
				act(() => vi.advanceTimersByTime(1000));
			}
		}
	}
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});
it("invalidates exactly when the configured timezone crosses midnight and cleans up", () => {
	const client = new QueryClient({
		defaultOptions: { queries: { enabled: false, retry: false } },
	});
	const view = render(
		<QueryClientProvider client={client}>
			<PrayerTimesPage />
		</QueryClientProvider>,
	);
	act(() => vi.advanceTimersByTime(1000));
	expect(state.invalidate).not.toHaveBeenCalled();
	act(() => vi.advanceTimersByTime(1000));
	expect(state.invalidate).toHaveBeenCalledTimes(1);
	view.unmount();
	act(() => vi.advanceTimersByTime(3600000));
	expect(state.invalidate).toHaveBeenCalledTimes(1);
});
