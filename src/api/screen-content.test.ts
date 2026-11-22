import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
	readItemsScreenSections: vi.fn(),
	readItemsNews: vi.fn(),
	readItemsEvents: vi.fn(),
	readItemsCampaigns: vi.fn(),
	readItemsDonations: vi.fn(),
}));
vi.mock("./generated/sdk.gen", () => sdk);
vi.mock("../contexts", () => ({
	useNextPrayer: () => ({ nextPrayerName: null, nextPrayerTime: null }),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		handler: (f: unknown) => f,
		inputValidator: (validate: (p: never) => unknown) => ({
			handler:
				(f: (p: { data: unknown }) => unknown) =>
				({ data }: { data: never }) =>
					f({ data: validate(data) }),
		}),
	}),
}));

import CampaignProgress from "../components/campaign-progress";
import NextPrayerCountdown from "../components/next-prayer-countdown";
import ScreenContent from "../components/screen-content";
import { sanitizeScreenHtml } from "../lib/sanitize-screen-html";
import Footer from "../pages/prayer-times-page/footer";
import Header from "../pages/prayer-times-page/header";
import {
	contentQueryOptions,
	getScreenSummary,
} from "./collections/screen-content/queries";

beforeEach(() => vi.resetAllMocks());
it("renders a compact footer with three populated items and no address placeholder", () => {
	const markup = renderToStaticMarkup(React.createElement(Footer));
	expect(markup.match(/class="prayer-footer__item"/g)).toHaveLength(3);
	expect(markup).not.toContain("prayer-footer__separator");
	expect(markup).not.toContain("<span></span>");
});
it("gives the playlist clock its own labelled surface and respects clock visibility", () => {
	const client = new QueryClient();
	const props = {
		type: "news" as const,
		maxItems: 1,
		itemIndex: 0,
		language: "en",
		fallback: "en",
		timezone: "UTC",
		refresh: 60,
	};
	const renderClock = (showClock: boolean) =>
		renderToStaticMarkup(
			React.createElement(
				QueryClientProvider,
				{ client },
				React.createElement(ScreenContent, { ...props, showClock }),
			),
		);
	const visible = renderClock(true);
	expect(visible).toContain('class="playlist-clock"');
	expect(visible).toContain("Current time");
	expect(visible).toContain('class="prayer-clock"');
	expect(renderClock(false)).not.toContain('class="playlist-clock"');
});
it("keeps both CMS dates and branding in the redesigned header with the clock hidden", () => {
	const markup = renderToStaticMarkup(
		React.createElement(Header, {
			date: "2026-11-22",
			date_hijri: "1448-06-12",
			showClock: false,
		}),
	);
	expect(markup).toContain("22.11.2026");
	expect(markup).toContain("1448-06-12");
	expect(markup).toContain("Regensburg");
	expect(markup).not.toContain("prayer-header__clock");
});
it("filters content and propagates errors", async () => {
	sdk.readItemsNews.mockResolvedValue({ data: { data: [] } });
	await contentQueryOptions("news", 3).queryFn!({} as never);
	const news = sdk.readItemsNews.mock.calls[0][0].query;
	expect(news.limit).toBe(3);
	expect(JSON.parse(news.filter).status).toEqual({ _eq: "published" });
	expect(JSON.parse(news.filter)._and).toHaveLength(2);
	sdk.readItemsEvents.mockRejectedValue(new Error("unavailable"));
	await expect(
		contentQueryOptions("events", 2).queryFn!({} as never),
	).rejects.toThrow("unavailable");
});
it("returns aggregated confirmed and pending by currency, without donation records", async () => {
	sdk.readItemsCampaigns.mockResolvedValue({
		data: {
			data: [
				{ id: 1, currency: "EUR", target_amount: "100", translations: [] },
			],
		},
	});
	sdk.readItemsDonations.mockResolvedValue({
		data: {
			data: [
				{ campaign: 1, status: "confirmed", amount: "20", currency: "EUR" },
				{ campaign: 1, status: "pending", amount: "5", currency: "EUR" },
				{ campaign: 1, status: "refunded", amount: "50", currency: "EUR" },
				{ campaign: 1, status: "confirmed", amount: "7", currency: "USD" },
			],
		},
	});
	const result = await contentQueryOptions("campaign_progress", 2).queryFn!(
		{} as never,
	);
	expect(result.items[0]).toMatchObject({
		totals: {
			EUR: { confirmed: 20, pending: 5 },
			USD: { confirmed: 7, pending: 0 },
		},
	});
	expect(
		JSON.parse(sdk.readItemsCampaigns.mock.calls[0][0].query.filter)._and,
	).toHaveLength(2);
	expect(
		JSON.parse(sdk.readItemsDonations.mock.calls[0][0].query.filter).status._in,
	).toEqual(["confirmed", "pending"]);
});
it("keeps localized screen summaries separate from long-form content", () => {
	expect(getScreenSummary({ screen_summary: "A short display summary." })).toBe(
		"A short display summary.",
	);
	expect(getScreenSummary({ screen_summary: null })).toBeUndefined();
	expect(getScreenSummary(undefined)).toBeUndefined();
});
it("allows basic formatted HTML but strips attributes and unsafe elements", () => {
	expect(
		sanitizeScreenHtml(
			'<p class="x">A <strong>short</strong><br><em>summary</em></p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">link</a><ul style="color:red"><li>One</li></ul>',
		),
	).toBe(
		"<p>A <strong>short</strong><br><em>summary</em></p>link<ul><li>One</li></ul>",
	);
});
it("renders only sanitized formatted screen summary HTML", () => {
	const queryClient = new QueryClient();
	queryClient.setQueryData(["cms-screen-content", "news", 1], {
		type: "news",
		items: [
			{
				id: 1,
				translations: [
					{
						languages_code: "en",
						title: "Headline",
						screen_summary:
							"<p>Safe <strong>text</strong></p><img src=x onerror=alert(1)><script>alert(2)</script>",
					},
				],
			},
		],
	});
	const markup = renderToStaticMarkup(
		React.createElement(
			QueryClientProvider,
			{ client: queryClient },
			React.createElement(ScreenContent, {
				type: "news",
				maxItems: 1,
				itemIndex: 0,
				language: "en",
				fallback: "en",
				timezone: "UTC",
				showClock: false,
				refresh: 60,
			}),
		),
	);
	expect(markup).toContain("<p>Safe <strong>text</strong></p>");
	expect(markup).not.toContain("<img");
	expect(markup).not.toContain("<script");
	expect(markup).not.toContain("onerror");
});
it("renders an explicit localized unavailable next-prayer status", () => {
	const markup = renderToStaticMarkup(
		React.createElement(NextPrayerCountdown, { language: "ar" }),
	);
	expect(markup).toContain("موعد الصلاة غير متاح");
	expect(markup).not.toContain("NaN");
});
it("uses the first configured language as translation fallback without changing manual language", () => {
	const queryClient = new QueryClient();
	queryClient.setQueryData(["cms-screen-content", "news", 1], {
		type: "news",
		items: [
			{
				id: 1,
				translations: [
					{ languages_code: "de", title: "Deutsch" },
					{ languages_code: "en", title: "English" },
				],
			},
		],
	});

	const markup = renderToStaticMarkup(
		React.createElement(
			QueryClientProvider,
			{ client: queryClient },
			React.createElement(ScreenContent, {
				type: "news",
				maxItems: 1,
				itemIndex: 0,
				language: "ar",
				fallback: "en",
				timezone: "UTC",
				showClock: false,
				refresh: 60,
			}),
		),
	);
	expect(markup).toContain('lang="ar"');
	expect(markup).toContain("English");
});

it("charts received and pledged separately, capped at the goal without mixing currencies", () => {
	const markup = renderToStaticMarkup(
		React.createElement(CampaignProgress, {
			totals: {
				EUR: { confirmed: 80, pending: 50 },
				USD: { confirmed: 1000, pending: 0 },
			},
			currency: "EUR",
			target: 100,
			language: "en",
		}),
	);
	expect(markup).toContain("130%");
	expect(markup).toContain('style="width:80%"');
	expect(markup).toContain('style="width:20%"');
	expect(markup).toContain("€130.00");
	expect(markup).toContain("€0.00");
	expect(markup).toContain("$1,000.00");
});

it("omits the goal chart without a positive target and shows a fully funded capped bar", () => {
	const props = {
		totals: { EUR: { confirmed: 120, pending: 5 } },
		currency: "EUR",
		language: "en",
	};
	const noGoal = renderToStaticMarkup(
		React.createElement(CampaignProgress, { ...props, target: 0 }),
	);
	expect(noGoal).not.toContain('role="img"');
	const funded = renderToStaticMarkup(
		React.createElement(CampaignProgress, { ...props, target: 100 }),
	);
	expect(funded).toContain("125%");
	expect(funded).toContain('style="width:100%"');
	expect(funded).toContain('style="width:0%"');
	expect(funded).not.toContain("NaN");
});

it("shows the combined sum and percentage for received money plus pledges", () => {
	const markup = renderToStaticMarkup(
		React.createElement(CampaignProgress, {
			totals: { EUR: { confirmed: 135030.71, pending: 116000 } },
			currency: "EUR",
			target: 1200000,
			language: "en",
		}),
	);
	expect(markup).toContain("20.9%");
	expect(markup).toContain("€251,030.71");
	expect(markup).toContain("€948,969.29");
	expect(markup).toContain("Total (received + pledged)");
});
