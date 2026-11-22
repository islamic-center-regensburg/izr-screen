import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	readItemsCampaigns,
	readItemsDonations,
	readItemsEvents,
	readItemsNews,
	readItemsScreenSections,
} from "../../generated/sdk.gen";

export const sectionsQueryOptions = () =>
	queryOptions({
		queryKey: ["cms-screen-sections"],
		queryFn: () => fetchSections(),
	});
const fetchSections = createServerFn({ method: "GET" }).handler(async () => {
	const { data } = await readItemsScreenSections({
		query: { limit: -1, sort: ["sort", "id"] },
		throwOnError: true,
	});
	return data?.data ?? [];
});

type Text = {
	languages_code: string;
	title?: string;
	name?: string;
	body?: string | null;
	description?: string | null;
	screen_summary?: string | null;
	location?: string | null;
};
export function getScreenSummary(
	text: Pick<Text, "screen_summary"> | undefined,
) {
	return text?.screen_summary?.trim() || undefined;
}
function translations(rows: unknown): Text[] {
	return (Array.isArray(rows) ? rows : []).flatMap((row) => {
		if (!row || typeof row !== "object") return [];
		const code =
			typeof row.languages_code === "string"
				? row.languages_code
				: row.languages_code?.code;
		if (typeof code !== "string") return [];
		return [
			{
				languages_code: code,
				title: row.title,
				name: row.name,
				body: row.body,
				description: row.description,
				screen_summary: row.screen_summary,
				location: row.location,
			},
		];
	});
}
export type ContentKind = "news" | "events" | "campaign_progress";
type Params = { type: ContentKind; limit: number };
const fetchContent = createServerFn({ method: "GET" })
	.inputValidator((p: Params) => {
		if (
			!["news", "events", "campaign_progress"].includes(p.type) ||
			!Number.isInteger(p.limit) ||
			p.limit < 1
		)
			throw new Error("Invalid section request");
		return p;
	})
	.handler(async ({ data: { type, limit } }) => {
		const now = new Date().toISOString();
		if (type === "news") {
			const { data } = await readItemsNews({
				query: {
					filter: JSON.stringify({
						status: { _eq: "published" },
						_and: [
							{
								_or: [
									{ published_at: { _null: true } },
									{ published_at: { _lte: now } },
								],
							},
							{
								_or: [
									{ expires_at: { _null: true } },
									{ expires_at: { _gte: now } },
								],
							},
						],
					}),
					sort: ["-published_at", "id"],
					fields: ["id", "published_at", "translations.*"],
					limit,
				},
				throwOnError: true,
			});
			return {
				type,
				items: (data?.data ?? []).map((item) => ({
					id: item.id,
					translations: translations(item.translations),
				})),
			};
		}
		if (type === "events") {
			const { data } = await readItemsEvents({
				query: {
					filter: JSON.stringify({
						status: { _eq: "published" },
						starts_at: { _gte: now },
					}),
					sort: ["starts_at", "id"],
					fields: ["id", "starts_at", "translations.*"],
					limit,
				},
				throwOnError: true,
			});
			return {
				type,
				items: (data?.data ?? []).map((item) => ({
					id: item.id,
					starts_at: item.starts_at,
					translations: translations(item.translations),
				})),
			};
		}
		const { data } = await readItemsCampaigns({
			query: {
				filter: JSON.stringify({
					status: { _eq: "active" },
					_and: [
						{
							_or: [
								{ starts_at: { _null: true } },
								{ starts_at: { _lte: now } },
							],
						},
						{ _or: [{ ends_at: { _null: true } }, { ends_at: { _gte: now } }] },
					],
				}),
				sort: ["-starts_at", "id"],
				fields: ["id", "target_amount", "currency", "translations.*"],
				limit,
			},
			throwOnError: true,
		});
		const campaigns = data?.data ?? [];
		const ids = campaigns.flatMap((c) => (c.id == null ? [] : [c.id]));
		if (!ids.length) return { type, items: [] };
		const donations = await readItemsDonations({
			query: {
				filter: JSON.stringify({
					campaign: { _in: ids },
					status: { _in: ["confirmed", "pending"] },
				}),
				fields: [
					"campaign",
					"amount",
					"currency",
					"status",
					"donated_at",
					"method",
				],
				limit: -1,
			},
			throwOnError: true,
		});
		return {
			type,
			items: campaigns.map((c) => ({
				id: c.id,
				currency: c.currency,
				target_amount: c.target_amount,
				translations: translations(c.translations),
				totals: (donations.data?.data ?? [])
					.filter((d) => d.campaign === c.id)
					.reduce<Record<string, { confirmed: number; pending: number }>>(
						(totals, d) => {
							if (
								(d.status !== "confirmed" && d.status !== "pending") ||
								!Number.isFinite(Number(d.amount))
							)
								return totals;
							const currency = d.currency || "EUR";
							totals[currency] ??= { confirmed: 0, pending: 0 };
							totals[currency][d.status] += Number(d.amount);
							return totals;
						},
						{},
					),
			})),
		};
	});
export const contentQueryOptions = (type: ContentKind, limit: number) =>
	queryOptions({
		queryKey: ["cms-screen-content", type, limit],
		queryFn: () => fetchContent({ data: { type, limit } }),
	});
