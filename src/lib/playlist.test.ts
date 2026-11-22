import { describe, expect, it } from "vitest";
import type { ItemsScreenSections } from "@/api/generated/types.gen";
import { advancePlaylist, playlistDuration, visibleSections } from "./playlist";

const section = (
	id: number,
	sort: number,
	extra: Partial<ItemsScreenSections> = {},
): ItemsScreenSections => ({
	id,
	sort,
	name: String(id),
	type: "news",
	enabled: true,
	...extra,
});
describe("screen sections", () => {
	it("sorts by sort then id, excludes disabled and unsupported entries", () => {
		expect(
			visibleSections(
				[
					section(3, 1),
					section(2, 1),
					section(1, 0, { enabled: false }),
					section(4, 0, { type: "other" }),
				],
				1000,
			).map((s) => s.id),
		).toEqual([2, 3]);
	});
	it("includes visibility boundaries and excludes out-of-window or invalid timestamps", () => {
		const at = "2026-01-01T00:00:00Z";
		const now = Date.parse(at);
		expect(
			visibleSections(
				[
					section(1, 0, { visible_from: at }),
					section(2, 1, { visible_until: at }),
					section(3, 2, { visible_from: "invalid" }),
					section(4, 3, { visible_until: "2025-12-31T23:59:59Z" }),
				],
				now,
			).map((s) => s.id),
		).toEqual([1]);
	});
});

it("derives and advances the entire cycle from current durations and visibility", () => {
	const boundary = "2026-01-01T00:00:10Z";
	const rows = [
		section(1, 1, { type: "prayer_times", duration_seconds: 3 }),
		section(2, 2, {
			type: "events",
			duration_seconds: 2,
			max_items: 3,
			visible_until: boundary,
		}),
		section(3, 3, { duration_seconds: 7, enabled: false }),
	];
	const active = visibleSections(rows, Date.parse(boundary) - 1);
	const counts = { 2: 5 };
	expect(playlistDuration(active, counts)).toBe(9);
	let state = { id: 1 as number | null, itemIndex: 0, remaining: 3 };
	const visited = [];
	for (let i = 0; i < playlistDuration(active, counts); i++) {
		visited.push(`${state.id}:${state.itemIndex}`);
		state = advancePlaylist(active, state, counts);
	}
	expect(visited).toEqual([
		"1:0",
		"1:0",
		"1:0",
		"2:0",
		"2:0",
		"2:1",
		"2:1",
		"2:2",
		"2:2",
	]);
	expect(state).toEqual({ id: 1, itemIndex: 0, remaining: 3, cycle: 1 });
	expect(playlistDuration(active, { 2: 1 })).toBe(5);
	expect(
		playlistDuration(visibleSections(rows, Date.parse(boundary) + 1), counts),
	).toBe(3);
	rows[0].duration_seconds = 8;
	rows[2].enabled = true;
	expect(
		playlistDuration(visibleSections(rows, Date.parse(boundary) + 1), counts),
	).toBe(15);
});

it("advances one-second items instead of restarting them", () => {
	const rows = [
		section(1, 1, { duration_seconds: 1 }),
		section(2, 2, { duration_seconds: 1 }),
	];
	let state = { id: null as number | null, itemIndex: 0, remaining: 0 };
	state = advancePlaylist(rows, state, { 1: 2, 2: 1 });
	expect(state).toEqual({ id: 1, itemIndex: 0, remaining: 0 });
	state = advancePlaylist(rows, state, { 1: 2, 2: 1 });
	expect(state).toEqual({ id: 1, itemIndex: 1, remaining: 1 });
	state = advancePlaylist(rows, state, { 1: 2, 2: 1 });
	expect(state).toEqual({ id: 2, itemIndex: 0, remaining: 1, cycle: 0 });
});

it("starts at the first item when the active section disappears", () => {
	const rows = [section(2, 1, { duration_seconds: 3 })];
	expect(
		advancePlaylist(rows, { id: 1, itemIndex: 2, remaining: 5 }, { 2: 4 }),
	).toEqual({ id: 2, itemIndex: 0, remaining: 2 });
});
