import { useQuery } from "@tanstack/react-query";
import {
	type ContentKind,
	contentQueryOptions,
	getScreenSummary,
} from "@/api/collections/screen-content/queries";
import CampaignProgress from "@/components/campaign-progress";
import NextPrayerCountdown from "@/components/next-prayer-countdown";
import { useContentFit } from "@/hooks/use-content-fit";
import { sanitizeScreenHtml } from "@/lib/sanitize-screen-html";
import TickingHour from "@/pages/prayer-times-page/TickingHour";

type Translation = {
	languages_code: string | { code: string };
	title?: string;
	name?: string;
	body?: string | null;
	description?: string | null;
	screen_summary?: string | null;
	location?: string | null;
};
function translation(
	rows: unknown,
	language: string,
	fallback: string,
): Translation | undefined {
	const list = (Array.isArray(rows) ? rows : []).filter(
		(r): r is Translation => typeof r === "object" && r !== null,
	);
	const code = (r: Translation) =>
		typeof r.languages_code === "string"
			? r.languages_code
			: r.languages_code?.code;
	return (
		list.find((r) => code(r) === language) ??
		list.find((r) => code(r) === fallback) ??
		list[0]
	);
}
const labels: Record<string, Record<string, string>> = {
	de: {
		news: "Aktuelles",
		events: "Veranstaltungen",
		campaign_progress: "Spendenaktionen",
		empty: "Keine Inhalte verfügbar.",
		error: "Inhalte konnten nicht geladen werden.",
		loading: "Inhalte werden geladen…",
		received: "Erhalten",
		pending: "Zugesagt",
		goal: "Ziel",
	},
	en: {
		news: "News",
		events: "Events",
		campaign_progress: "Campaigns",
		empty: "No content available.",
		error: "Unable to load content.",
		loading: "Loading content…",
		received: "Received",
		pending: "Pledged",
		goal: "Goal",
	},
	ar: {
		news: "الأخبار",
		events: "الفعاليات",
		campaign_progress: "حملات التبرع",
		empty: "لا يوجد محتوى.",
		error: "تعذر تحميل المحتوى.",
		loading: "جار تحميل المحتوى…",
		received: "المستلم",
		pending: "المتعهد به",
		goal: "الهدف",
	},
};
export default function ScreenContent({
	type,
	maxItems,
	itemIndex,
	language,
	fallback,
	timezone,
	showClock,
	refresh,
}: {
	type: ContentKind;
	maxItems: number;
	itemIndex: number;
	language: string;
	fallback: string;
	timezone: string;
	showClock: boolean;
	refresh: number;
}) {
	const { data, isError, isPending } = useQuery({
		...contentQueryOptions(type, Math.max(1, maxItems)),
		refetchInterval: refresh * 1000,
	});
	const l = labels[language] ?? labels.de;
	const { viewportRef, contentRef } = useContentFit();
	return (
		<main
			className="content-screen"
			lang={language}
			dir={language === "ar" ? "rtl" : "ltr"}
		>
			<div className="content-screen__viewport" ref={viewportRef}>
				<div className="content-screen__fit" ref={contentRef}>
					<header className="content-screen__header">
						<div className="content-screen__heading">
							<span className="prayer-eyebrow">
								{language === "ar"
									? "مركز ريغنسبورغ الإسلامي"
									: language === "en"
										? "Islamic Center Regensburg"
										: "Islamisches Zentrum Regensburg"}
							</span>
							<h1>{l[type]}</h1>
						</div>
						<div className="content-screen__header-side">
							<NextPrayerCountdown language={language} />
							{showClock && (
								<div className="playlist-clock">
									<span>
										{language === "ar"
											? "الوقت الآن"
											: language === "en"
												? "Current time"
												: "Uhrzeit"}
									</span>
									<TickingHour timezone={timezone} />
								</div>
							)}
						</div>
					</header>
					{isError && <p role="alert">{l.error}</p>}
					{isPending && <p>{l.loading}</p>}
					{data && !data.items.length && <p>{l.empty}</p>}
					{data?.items[itemIndex] &&
						(() => {
							const item = data.items[itemIndex];
							const t = translation(item.translations, language, fallback);
							const summary = getScreenSummary(t);
							return (
								<article
									className="content-screen__card"
									key={item.id ?? itemIndex}
								>
									<h2>{t?.title ?? t?.name ?? "—"}</h2>
									{(("starts_at" in item && item.starts_at) || t?.location) && (
										<div className="content-screen__metadata">
											{"starts_at" in item && item.starts_at && (
												<time dateTime={item.starts_at}>
													{new Intl.DateTimeFormat(language, {
														dateStyle: "full",
														timeStyle: "short",
														timeZone: timezone,
													}).format(new Date(item.starts_at))}
												</time>
											)}
											{t?.location && <span>{t.location}</span>}
										</div>
									)}
									{summary && (
										<div
											className="content-screen__text"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify sanitizes CMS rich text before intentional HTML rendering.
											dangerouslySetInnerHTML={{
												__html: sanitizeScreenHtml(summary),
											}}
										/>
									)}
									{"totals" in item && (
										<CampaignProgress
											totals={item.totals}
											currency={item.currency ?? "EUR"}
											target={item.target_amount}
											language={language}
										/>
									)}
								</article>
							);
						})()}
				</div>
			</div>
		</main>
	);
}
