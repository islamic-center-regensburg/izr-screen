// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScreenConfig } from "@/api/screen-config";
import IZRPage from "@/pages/izr-page";
import RamadanPage from "@/pages/ramadan-page";
import { ScreenConfigProvider, useScreenConfig } from "./screen-config-context";

const router = vi.hoisted(() => ({
	pathname: "/",
	navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => router.navigate,
	useRouterState: () => router.pathname,
}));

const config: ScreenConfig = {
	id: "screen",
	mode: "manual",
	manual_view: "prayer_times",
	dashboard_url: "https://iz-regensburg.de/dashboard",
	dashboard_enabled: true,
	dashboard_interval_minutes: 15,
	dashboard_duration_seconds: 90,
	manual_expires_at: null,
	date_updated: "2026-11-06T12:00:00",
};

function State() {
	const { config, isManual } = useScreenConfig();
	return (
		<div data-testid="state">
			{isManual ? "manual" : "automatic"}:{config?.manual_view}
		</div>
	);
}

function mount(children = <State />) {
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: 0 } },
	});
	render(
		<QueryClientProvider client={client}>
			<ScreenConfigProvider>{children}</ScreenConfigProvider>
		</QueryClientProvider>,
	);
	return client;
}

async function settle() {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(20);
	});
}

beforeEach(() => {
	vi.useFakeTimers();
	sessionStorage.clear();
	router.pathname = "/";
	router.navigate.mockReset();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("screen control", () => {
	it("polls every two seconds and applies a changed manual route", async () => {
		let current = config;
		const fetch = vi
			.fn()
			.mockImplementation(
				async () => new Response(JSON.stringify({ data: current })),
			);
		vi.stubGlobal("fetch", fetch);
		mount();
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("manual:prayer_times");
		expect(fetch).toHaveBeenCalledTimes(1);

		current = { ...config, manual_view: "ramadan" };
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2_000);
		});
		await settle();
		expect(fetch).toHaveBeenCalledTimes(2);
		expect(router.navigate).toHaveBeenCalledWith({
			to: "/ramadan",
			replace: true,
		});
	});

	it("retains the last valid config and visibly reports polling failures", async () => {
		const fetch = vi
			.fn()
			.mockResolvedValue(new Response(JSON.stringify({ data: config })));
		vi.stubGlobal("fetch", fetch);
		vi.spyOn(console, "error").mockImplementation(() => {});
		mount();
		await settle();
		fetch.mockResolvedValue(new Response("", { status: 503 }));
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2_000);
		});
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("manual:prayer_times");
		expect(screen.getByRole("status").textContent).toContain(
			"Konfiguration nicht erreichbar",
		);

		fetch.mockImplementation(
			async () => new Response(JSON.stringify({ data: config })),
		);
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2_000);
		});
		await settle();
		expect(screen.queryByRole("status")).toBeNull();
	});

	it("uses automatic mode if no valid config has been loaded", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("", { status: 503 })),
		);
		vi.spyOn(console, "error").mockImplementation(() => {});
		mount();
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("automatic:");
		expect(screen.getByRole("status")).not.toBeNull();
	});

	it("restores a cached manual config when Directus is unavailable", async () => {
		sessionStorage.setItem("izr:screenConfig", JSON.stringify(config));
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		vi.spyOn(console, "error").mockImplementation(() => {});
		mount();
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("manual:prayer_times");
	});

	it("expires a manual override locally without needing another config update", async () => {
		router.pathname = "/ramadan";
		const expiring = {
			...config,
			manual_view: "ramadan",
			manual_expires_at: new Date(Date.now() + 1_000).toISOString(),
		};
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async () => new Response(JSON.stringify({ data: expiring })),
				),
		);
		mount();
		await settle();
		expect(screen.getByTestId("state").textContent).toBe("manual:ramadan");
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_000);
		});
		expect(screen.getByTestId("state").textContent).toBe("automatic:ramadan");
		expect(router.navigate).toHaveBeenCalledWith({ to: "/", replace: true });
	});

	it("does not trap a failed prayer-times loader in a navigation loop", async () => {
		router.pathname = "/problem";
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: config }))),
		);
		mount();
		await settle();
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it("shows prayer times for exactly two seconds before repeating a manual dashboard visit", async () => {
		const dashboardConfig = { ...config, manual_view: "dashboard" as const };
		sessionStorage.setItem("izr:screenConfig", JSON.stringify(dashboardConfig));
		const assign = vi.fn();
		vi.stubGlobal("window", {
			location: { origin: "http://localhost", assign },
		});
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async () => new Response(JSON.stringify({ data: dashboardConfig })),
				),
		);
		mount();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_999);
		});
		expect(screen.getByTestId("state").textContent).toBe("manual:dashboard");
		expect(router.navigate).not.toHaveBeenCalled();
		expect(assign).not.toHaveBeenCalled();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1);
		});
		expect(assign).toHaveBeenCalledOnce();
		const url = new URL(assign.mock.calls[0][0]);
		expect(url.searchParams.get("fullscreen")).toBe("true");
		expect(url.searchParams.get("callback")).toBe("http://localhost/");
		expect(url.searchParams.get("time")).toBe("90");
	});

	it("cancels the pending dashboard visit if the latest config selects another view", async () => {
		const dashboardConfig = { ...config, manual_view: "dashboard" as const };
		sessionStorage.setItem("izr:screenConfig", JSON.stringify(dashboardConfig));
		const assign = vi.fn();
		vi.stubGlobal("window", {
			location: { origin: "http://localhost", assign },
		});
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async () => new Response(JSON.stringify({ data: config })),
				),
		);
		mount();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(3_000);
		});
		expect(screen.getByTestId("state").textContent).toBe("manual:prayer_times");
		expect(assign).not.toHaveBeenCalled();
	});

	it("cancels the pending dashboard visit when the manual override expires", async () => {
		const expiring = {
			...config,
			manual_view: "dashboard",
			manual_expires_at: new Date(Date.now() + 1_000).toISOString(),
		};
		const assign = vi.fn();
		vi.stubGlobal("window", {
			location: { origin: "http://localhost", assign },
		});
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async () => new Response(JSON.stringify({ data: expiring })),
				),
		);
		mount();
		await settle();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(3_000);
		});
		expect(screen.getByTestId("state").textContent).toBe("automatic:dashboard");
		expect(assign).not.toHaveBeenCalled();
	});

	it.each([
		["izr", IZRPage],
		["ramadan", RamadanPage],
	] as const)(
		"holds the manual %s page beyond its normal ten-second timer",
		async (view, Page) => {
			router.pathname = `/${view}`;
			vi.stubGlobal(
				"fetch",
				vi
					.fn()
					.mockImplementation(
						async () =>
							new Response(
								JSON.stringify({ data: { ...config, manual_view: view } }),
							),
					),
			);
			mount(<Page />);
			await settle();
			await act(async () => {
				await vi.advanceTimersByTimeAsync(12_000);
			});
			expect(router.navigate).not.toHaveBeenCalled();
		},
	);
});
