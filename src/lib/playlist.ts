import type { ItemsScreenSections } from "@/api/generated/types.gen";
export type PlaylistPosition = {
	id: number | null;
	itemIndex: number;
	remaining: number;
	cycle?: number;
};

export function visibleSections(sections: ItemsScreenSections[], now: number) {
	return sections
		.filter(
			(s) =>
				s.enabled &&
				["prayer_times", "news", "events", "campaign_progress"].includes(
					s.type,
				) &&
				(!s.visible_from ||
					(Number.isFinite(Date.parse(s.visible_from)) &&
						Date.parse(s.visible_from) <= now)) &&
				(!s.visible_until ||
					(Number.isFinite(Date.parse(s.visible_until)) &&
						Date.parse(s.visible_until) > now)),
		)
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || (a.id ?? 0) - (b.id ?? 0));
}

export function itemCounts(
	sections: ItemsScreenSections[],
	counts: Partial<Record<number, number>>,
) {
	return Object.fromEntries(
		sections.map((s) => [
			s.id ?? 0,
			s.type === "prayer_times"
				? 1
				: Math.min(
						Math.max(1, s.max_items ?? 5),
						Math.max(1, counts[s.id ?? 0] ?? 0),
					),
		]),
	);
}

export function playlistDuration(
	sections: ItemsScreenSections[],
	counts: Partial<Record<number, number>> = {},
) {
	const perSection = itemCounts(sections, counts);
	return sections.reduce(
		(total, section) =>
			total +
			Math.max(1, section.duration_seconds ?? 15) * perSection[section.id ?? 0],
		0,
	);
}

export function advancePlaylist(
	sections: ItemsScreenSections[],
	position: PlaylistPosition,
	counts: Partial<Record<number, number>> = {},
) {
	const { id } = position;
	const current = sections.find((s) => s.id === id) ?? sections[0];
	if (!current) return { ...position, id: null, itemIndex: 0, remaining: 0 };
	const items = itemCounts(sections, counts)[current.id ?? 0] ?? 1;
	const itemIndex =
		id === current.id
			? Math.max(0, Math.min(position.itemIndex, items - 1))
			: 0;
	const duration = Math.max(1, current.duration_seconds ?? 15);
	if (id !== current.id || itemIndex !== position.itemIndex)
		return {
			...position,
			id: current.id ?? null,
			itemIndex,
			remaining: duration - 1,
		};
	if (position.remaining > 1)
		return {
			...position,
			id: current.id ?? null,
			itemIndex,
			remaining: position.remaining - 1,
		};
	if (position.remaining <= 0 && duration > 1)
		return {
			...position,
			id: current.id ?? null,
			itemIndex,
			remaining: duration - 1,
		};
	if (itemIndex + 1 < items)
		return {
			...position,
			id: current.id ?? null,
			itemIndex: itemIndex + 1,
			remaining: Math.max(1, current.duration_seconds ?? 15),
		};
	const next = sections[(sections.indexOf(current) + 1) % sections.length];
	return {
		...position,
		id: next.id ?? null,
		itemIndex: 0,
		remaining: Math.max(1, next.duration_seconds ?? 15),
		cycle: (position.cycle ?? 0) + (next === sections[0] ? 1 : 0),
	};
}
