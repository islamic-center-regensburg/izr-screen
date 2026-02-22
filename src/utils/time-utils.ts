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

export const nowTime = ({ offsetMinutes = 0, baseTime }: NowProps): Date => {
	const baseNow = baseTime ?? getMockNow() ?? new Date();

	if (!Number.isFinite(offsetMinutes) || offsetMinutes === 0) {
		return new Date(baseNow.getTime());
	}

	return new Date(baseNow.getTime() + offsetMinutes * 60 * 1000);
};
