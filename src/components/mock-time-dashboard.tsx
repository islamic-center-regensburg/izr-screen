import { useEffect, useMemo, useState } from "react";
import { clearMockNow, getMockNow, setMockNow } from "@/utils/time-utils";

const toLocalDateTimeInputValue = (date: Date): string => {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function MockTimeDashboard() {
	const [inputValue, setInputValue] = useState<string>(() =>
		toLocalDateTimeInputValue(new Date()),
	);
	const [mockNow, setMockNowState] = useState<Date | null>(null);

	useEffect(() => {
		const syncMockState = () => {
			setMockNowState(getMockNow());
		};

		syncMockState();
		const interval = window.setInterval(syncMockState, 1000);

		return () => window.clearInterval(interval);
	}, []);

	const activeMockLabel = useMemo(() => {
		if (!mockNow) return "No active mock";
		return mockNow.toLocaleString();
	}, [mockNow]);

	const applyMock = () => {
		if (!inputValue) return;
		const selectedDate = new Date(inputValue);
		if (Number.isNaN(selectedDate.getTime())) return;
		setMockNow(selectedDate);
		setMockNowState(getMockNow());
	};

	const clearMock = () => {
		clearMockNow();
		setMockNowState(null);
	};

	return (
		<div className="fixed right-4 bottom-4 z-50 flex w-90 flex-col gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-md">
			<div className="text-sm font-semibold">Mock Time</div>
			<div className="text-xs text-muted-foreground">{activeMockLabel}</div>
			<input
				type="datetime-local"
				value={inputValue}
				onChange={(event) => setInputValue(event.target.value)}
				className="rounded-md border border-input bg-background px-2 py-1 text-sm"
			/>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={applyMock}
					className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
				>
					Apply
				</button>
				<button
					type="button"
					onClick={clearMock}
					className="rounded-md border border-input px-3 py-1 text-sm"
				>
					Clear
				</button>
			</div>
		</div>
	);
}

export default MockTimeDashboard;
