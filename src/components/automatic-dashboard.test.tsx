// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import AutomaticDashboard from "./automatic-dashboard";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});
it("does not contact the removed external dashboard", () => {
	const fetch = vi.fn();
	vi.stubGlobal("fetch", fetch);
	const view = render(<AutomaticDashboard prayerTimes={{ asr: "15:00" }} />);
	expect(view.container.innerHTML).toBe("");
	expect(fetch).not.toHaveBeenCalled();
});
