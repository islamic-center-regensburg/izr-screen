// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IZRPage from "@/pages/izr-page";
import RamadanPage from "@/pages/ramadan-page";
import { ScreenConfigProvider, useScreenConfig } from "./screen-config-context";

const router = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => router.navigate,
}));
vi.mock("@/api/collections/screen-config/queries", () => ({
	screenConfigQueryOptions: () => ({
		queryKey: ["cms-screen-settings"],
		queryFn: async () => ({ mode: "automatic" }),
	}),
}));
function State() {
	const { isManual } = useScreenConfig();
	return <span data-testid="state">{isManual ? "manual" : "automatic"}</span>;
}
function renderWithConfig(children: React.ReactNode, mode = "automatic") {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	client.setQueryData(["cms-screen-settings"], { mode });
	return render(
		<QueryClientProvider client={client}>
			<ScreenConfigProvider>{children}</ScreenConfigProvider>
		</QueryClientProvider>,
	);
}
beforeEach(() => {
	vi.useFakeTimers();
	sessionStorage.clear();
	router.navigate.mockReset();
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.unstubAllGlobals();
});
describe("automatic screen provider", () => {
	it("ignores legacy cached overrides and never polls the old endpoint", async () => {
		sessionStorage.setItem(
			"izr:screenConfig",
			JSON.stringify({ mode: "manual", manual_view: "dashboard" }),
		);
		const fetch = vi.fn();
		vi.stubGlobal("fetch", fetch);
		renderWithConfig(<State />);
		await act(async () => {
			await vi.advanceTimersByTimeAsync(10_000);
		});
		expect(screen.getByTestId("state").textContent).toBe("automatic");
		expect(fetch).not.toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});
	it.each([
		["izr", IZRPage],
		["ramadan", RamadanPage],
	] as const)(
		"returns from the %s interruption automatically",
		async (_, Page) => {
			renderWithConfig(<Page />);
			for (let i = 0; i < 12; i++)
				await act(async () => {
					await vi.advanceTimersByTimeAsync(1000);
				});
			expect(router.navigate).toHaveBeenCalledWith({ to: "/" });
		},
	);
});
