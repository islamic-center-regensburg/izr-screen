// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PrayerCard from "./PrayerCard";

const state = vi.hoisted(() => ({
	isManual: false,
	navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => state.navigate,
}));

vi.mock("@/contexts/screen-config-context", () => ({
	useScreenConfig: () => state,
}));

vi.mock("@/contexts", () => ({
	useNextPrayer: () => ({
		nextPrayerName: "dhuhr",
		nextPrayerTime: "12:05",
	}),
}));

vi.mock("@/hooks/usePrayerIqama", () => ({
	default: () => ({
		prayerIqama: { mode: "fixed", fixed_time: "12:05" },
	}),
}));

vi.mock("@/utils/time-utils", () => ({
	nowTime: () => new Date(),
}));

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 10, 6, 12, 5));
	state.isManual = false;
	state.navigate.mockReset();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe("Iqama navigation", () => {
	it("preserves the no-phone transition in automatic mode", () => {
		render(<PrayerCard prayerName="dhuhr" prayerTime="12:00" />);
		expect(state.navigate).toHaveBeenCalledWith({
			to: "/no-phone/$countdown",
			params: { countdown: "7" },
		});
	});

	it("does not leave prayer times in manual mode", () => {
		state.isManual = true;
		render(<PrayerCard prayerName="dhuhr" prayerTime="12:00" />);
		expect(state.navigate).not.toHaveBeenCalled();
	});

	it("resumes the Iqama transition when manual mode ends", () => {
		state.isManual = true;
		const { rerender } = render(
			<PrayerCard prayerName="dhuhr" prayerTime="12:00" />,
		);
		expect(state.navigate).not.toHaveBeenCalled();
		state.isManual = false;
		rerender(<PrayerCard prayerName="dhuhr" prayerTime="12:00" />);
		expect(state.navigate).toHaveBeenCalledWith({
			to: "/no-phone/$countdown",
			params: { countdown: "7" },
		});
	});
});
