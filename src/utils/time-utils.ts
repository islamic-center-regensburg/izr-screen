interface NowProps {
	offsetMinutes?: number;
	baseTime?: Date;
}

interface MockClockState {
	baseMs: number;
	realStartMs: number;
}

const MOCK_NOW_STORAGE_KEY = "izr:mockNow";

let mockClockState: MockClockState | null = null;

const parseMockTime = (value?: string | null): number | null => {
	if (!value) return null;
	const parsedMs = Date.parse(value);
	return Number.isFinite(parsedMs) ? parsedMs : null;
};

const hasWindow = (): boolean => typeof window !== "undefined";

const resolveMockClockState = (): MockClockState | null => {
	if (mockClockState) return mockClockState;
	if (!hasWindow()) return null;

	const storedValue = window.localStorage.getItem(MOCK_NOW_STORAGE_KEY);
	const parsedMs = parseMockTime(storedValue);

	if (parsedMs === null) return null;

	mockClockState = {
		baseMs: parsedMs,
		realStartMs: Date.now(),
	};

	return mockClockState;
};

export const setMockNow = (value: Date | string): boolean => {
	const parsedMs =
		typeof value === "string" ? parseMockTime(value) : value.getTime();

	if (parsedMs === null || !Number.isFinite(parsedMs)) return false;

	mockClockState = {
		baseMs: parsedMs,
		realStartMs: Date.now(),
	};

	if (hasWindow()) {
		window.localStorage.setItem(
			MOCK_NOW_STORAGE_KEY,
			new Date(parsedMs).toISOString(),
		);
	}

	return true;
};

export const clearMockNow = (): void => {
	mockClockState = null;
	if (hasWindow()) {
		window.localStorage.removeItem(MOCK_NOW_STORAGE_KEY);
	}
};

export const getMockNow = (): Date | null => {
	const state = resolveMockClockState();
	if (!state) return null;

	const elapsedMs = Date.now() - state.realStartMs;
	return new Date(state.baseMs + elapsedMs);
};

let displayTimezone: string | undefined;
export const setDisplayTimezone = (timezone: string | undefined) => {
	displayTimezone = timezone;
};

export const nowTime = ({ offsetMinutes = 0, baseTime }: NowProps): Date => {
	let baseNow = baseTime ?? getMockNow() ?? new Date();
	if (displayTimezone) {
		const parts = new Intl.DateTimeFormat("en-GB", {
			timeZone: displayTimezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hourCycle: "h23",
		}).formatToParts(baseNow);
		const part = (name: string) =>
			Number(parts.find((p) => p.type === name)?.value);
		baseNow = new Date(
			part("year"),
			part("month") - 1,
			part("day"),
			part("hour"),
			part("minute"),
			part("second"),
			baseNow.getMilliseconds(),
		);
	}

	if (!Number.isFinite(offsetMinutes) || offsetMinutes === 0) {
		return new Date(baseNow.getTime());
	}

	return new Date(baseNow.getTime() + offsetMinutes * 60 * 1000);
};

export function timeUntilTomorrow(targetTime: string): number {
	const now = getMockNow() ?? new Date();
	const wallNow = nowTime({ baseTime: now });
	const [hours, minutes] = targetTime.split(":").map(Number);
	const targetWallMs = Date.UTC(
		wallNow.getFullYear(),
		wallNow.getMonth(),
		wallNow.getDate() + 1,
		hours,
		minutes,
	);
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone:
			displayTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	});
	let targetMs = targetWallMs;
	for (let i = 0; i < 2; i++) {
		const parts = formatter.formatToParts(new Date(targetMs));
		const part = (name: string) =>
			Number(parts.find((value) => value.type === name)?.value);
		const formattedMs = Date.UTC(
			part("year"),
			part("month") - 1,
			part("day"),
			part("hour"),
			part("minute"),
			part("second"),
		);
		targetMs += targetWallMs - formattedMs;
	}
	return targetMs - now.getTime();
}
