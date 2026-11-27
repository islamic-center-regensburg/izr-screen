import { useQueries, useQuery } from "@tanstack/react-query";
import { useLoaderData, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { screenConfigQueryOptions } from "@/api/collections/screen-config/queries";
import {
	type ContentKind,
	contentQueryOptions,
	sectionsQueryOptions,
} from "@/api/collections/screen-content/queries";
import type { PrayerTimesOut } from "@/api/gen";
import type { ItemsScreenConfig } from "@/api/generated/types.gen";
import ScreenContent from "@/components/screen-content";
import { NextPrayerProvider, useNextPrayer } from "@/contexts";
import {
	advancePlaylist,
	itemCounts,
	type PlaylistPosition,
	visibleSections,
} from "@/lib/playlist";
import { calendarDate } from "@/utils/calendar-date";
import {
	nowTime,
	setDisplayTimezone,
	timeUntilTomorrow,
} from "@/utils/time-utils";
import ProblemPage from "../problem-page";
import Footer from "./footer";
import Header from "./header";
import PrayerTimesGrid from "./prayer-times-grid";

function Playlist({
	prayerTimes,
	settings,
}: {
	prayerTimes: PrayerTimesOut | null;
	settings: Partial<ItemsScreenConfig>;
}) {
	const refresh = Math.max(1, settings.refresh_interval_seconds ?? 60);
	const sectionsQuery = useQuery({
		...sectionsQueryOptions(),
		refetchInterval: refresh * 1000,
	});
	const [now, setNow] = useState(Date.now);
	const [position, setPosition] = useState<PlaylistPosition>(() => {
		try {
			const saved = JSON.parse(
				sessionStorage.getItem("izr:playlist") || "null",
			);
			return saved &&
				typeof saved.id === "string" &&
				typeof saved.remaining === "number"
				? {
						id: saved.id,
						itemIndex: Number.isInteger(saved.itemIndex) ? saved.itemIndex : 0,
						remaining: saved.remaining,
						cycle:
							Number.isInteger(saved.cycle) && saved.cycle >= 0
								? saved.cycle
								: 0,
					}
				: { id: null, itemIndex: 0, remaining: 0, cycle: 0 };
		} catch {
			return { id: null, itemIndex: 0, remaining: 0, cycle: 0 };
		}
	});
	const [manualPosition, setManualPosition] = useState({
		sectionId: null as string | null,
		itemIndex: 0,
		remaining: 0,
	});
	const durationRef = useRef<{
		id: string | undefined;
		duration: number;
	} | null>(null);
	const { nextPrayerName, nextPrayerTime, nextPrayerIsTomorrow } =
		useNextPrayer();
	const mode =
		(settings as ItemsScreenConfig & { mode?: string }).mode === "manual"
			? "manual"
			: "automatic";
	const allSections = sectionsQuery.data ?? [];
	const sections = visibleSections(allSections, now);
	const selectedSection = (
		settings as ItemsScreenConfig & {
			manual_section?: string | { id?: string } | null;
		}
	).manual_section;
	const selectedSectionId =
		typeof selectedSection === "string"
			? selectedSection
			: (selectedSection?.id ?? null);
	const manualSection =
		selectedSectionId == null
			? undefined
			: allSections.find((section) => section.id === selectedSectionId);
	const targetSections =
		mode === "manual" ? (manualSection ? [manualSection] : []) : sections;
	const contentQueries = useQueries({
		queries: targetSections
			.filter((s) => s.type !== "prayer_times")
			.map((s) => ({
				...contentQueryOptions(
					s.type as ContentKind,
					Math.max(1, s.max_items ?? 5),
				),
				refetchInterval: refresh * 1000,
			})),
	});
	const counts: Partial<Record<string, number>> = {};
	targetSections
		.filter((s) => s.type !== "prayer_times")
		.forEach((section, index) => {
			const query = contentQueries[index];
			if (query?.data && section.id != null)
				counts[section.id] = query.data.items.length;
		});
	const countsBySection = itemCounts(targetSections, counts);
	const autoCurrent = sections.find((s) => s.id === position.id) ?? sections[0];
	const current = mode === "manual" ? manualSection : autoCurrent;
	const manualItemCount = countsBySection[manualSection?.id ?? ""] ?? 1;
	const itemIndex =
		mode === "manual"
			? manualPosition.sectionId === manualSection?.id
				? Math.min(manualPosition.itemIndex, manualItemCount - 1)
				: 0
			: autoCurrent?.id === position.id
				? Math.max(
						0,
						Math.min(
							position.itemIndex,
							(countsBySection[autoCurrent.id ?? ""] ?? 1) - 1,
						),
					)
				: 0;
	const clock = nowTime({});
	const seconds =
		clock.getHours() * 3600 + clock.getMinutes() * 60 + clock.getSeconds();
	const toSeconds = (v: string) => {
		const [h, m, s = 0] = v.split(":").map(Number);
		return h * 3600 + m * 60 + s;
	};
	const adhan =
		nextPrayerName && prayerTimes
			? (prayerTimes as unknown as Record<string, string>)[nextPrayerName]
			: null;
	const until = nextPrayerTime
		? nextPrayerIsTomorrow
			? timeUntilTomorrow(nextPrayerTime) / 1000
			: toSeconds(nextPrayerTime) - seconds
		: Infinity;
	const interrupt =
		!!prayerTimes &&
		((until >= 0 && until <= 300) ||
			(!nextPrayerIsTomorrow &&
				!!adhan &&
				!!nextPrayerTime &&
				seconds >= toSeconds(adhan) &&
				seconds <= toSeconds(nextPrayerTime)));
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);
	useEffect(() => {
		setManualPosition({
			sectionId: selectedSectionId,
			itemIndex: 0,
			remaining: Math.max(1, manualSection?.duration_seconds ?? 15),
		});
	}, [
		selectedSectionId,
		(settings as ItemsScreenConfig & { manual_language?: string })
			.manual_language,
	]);
	useEffect(() => {
		if (!current) {
			durationRef.current = null;
			return;
		}
		const duration = Math.max(1, current.duration_seconds ?? 15);
		const previous = durationRef.current;
		durationRef.current = { id: current.id, duration };
		if (
			previous &&
			previous.id === current.id &&
			previous.duration !== duration
		) {
			setPosition((state: PlaylistPosition) =>
				state.id === current.id
					? {
							...state,
							remaining: Math.max(
								1,
								state.remaining + duration - previous.duration,
							),
						}
					: state,
			);
		}
	}, [current?.id, current?.duration_seconds]);
	useEffect(() => {
		if (
			mode === "manual" ||
			!autoCurrent ||
			interrupt ||
			sectionsQuery.isPending ||
			sectionsQuery.isError
		)
			return;
		const timer = setTimeout(
			() =>
				setPosition((previous: PlaylistPosition) => {
					const state = advancePlaylist(sections, previous, counts);
					try {
						sessionStorage.setItem("izr:playlist", JSON.stringify(state));
					} catch {
						/* Storage is optional. */
					}
					return state;
				}),
			1000,
		);
		return () => clearTimeout(timer);
	}, [
		mode,
		position,
		autoCurrent?.id,
		autoCurrent?.duration_seconds,
		interrupt,
		sectionsQuery.isPending,
		sectionsQuery.isError,
		sections.map((s) => `${s.id}:${countsBySection[s.id ?? 0]}`).join(","),
		JSON.stringify(counts),
	]);
	useEffect(() => {
		if (
			mode !== "manual" ||
			!manualSection ||
			manualSection.type === "prayer_times" ||
			interrupt ||
			sectionsQuery.isPending ||
			sectionsQuery.isError
		)
			return;
		if (manualPosition.sectionId !== manualSection.id) return;
		const duration = Math.max(1, manualSection.duration_seconds ?? 15);
		const itemCount = countsBySection[manualSection.id ?? ""] ?? 1;
		const timer = setTimeout(
			() =>
				setManualPosition((previous) => {
					const state =
						previous.sectionId === manualSection.id
							? previous
							: {
									sectionId: manualSection.id ?? null,
									itemIndex: 0,
									remaining: duration,
								};
					if (state.remaining > 1)
						return { ...state, remaining: state.remaining - 1 };
					return {
						...state,
						itemIndex: (state.itemIndex + 1) % itemCount,
						remaining: duration,
					};
				}),
			1000,
		);
		return () => clearTimeout(timer);
	}, [
		mode,
		manualSection?.id,
		manualSection?.duration_seconds,
		manualSection?.type,
		manualPosition,
		interrupt,
		sectionsQuery.isPending,
		sectionsQuery.isError,
		countsBySection[manualSection?.id ?? ""],
	]);
	const languages = settings.languages?.length ? settings.languages : ["de"];
	const fallback = languages[0] || "de";
	const orderedLanguages = languages;
	const language =
		mode === "manual"
			? (settings as ItemsScreenConfig & { manual_language?: string })
					.manual_language || "de"
			: orderedLanguages[(position.cycle ?? 0) % orderedLanguages.length] ||
				fallback;
	const timezone = settings.timezone || "Europe/Berlin";
	const showPrayer = interrupt || current?.type === "prayer_times";
	return (
		<div
			className={`screen-layout screen-layout--${settings.orientation === "portrait" ? "portrait" : "landscape"}`}
		>
			{sectionsQuery.isError && (
				<p role="alert" className="screen-notice">
					Abschnitte konnten nicht geladen werden.
				</p>
			)}
			{sectionsQuery.isPending && (
				<p className="screen-notice">Abschnitte werden geladen…</p>
			)}
			{mode === "automatic" &&
				!sectionsQuery.isPending &&
				!sectionsQuery.isError &&
				!current && (
					<p className="screen-notice">Keine sichtbaren Abschnitte.</p>
				)}
			{mode === "manual" &&
				!sectionsQuery.isPending &&
				!sectionsQuery.isError &&
				!manualSection && (
					<p role="alert" className="screen-notice">
						Manueller Modus ist aktiv, aber der ausgewählte Abschnitt fehlt.
						Bitte wählen Sie in screen_config einen gültigen Abschnitt.
					</p>
				)}
			<div style={{ display: showPrayer ? undefined : "none" }}>
				{prayerTimes ? (
					<div className="prayer-screen">
						<div className="prayer-screen__wash" aria-hidden="true" />
						<div className="prayer-screen__content">
							<Header
								date={prayerTimes.gregorian_date}
								date_hijri={prayerTimes.hijri_date}
								showClock={settings.show_clock !== false}
								timezone={timezone}
							/>
							<PrayerTimesGrid prayerTimes={prayerTimes} />
							<Footer />
						</div>
					</div>
				) : (
					<ProblemPage />
				)}
			</div>
			{!showPrayer && current && current.type !== "prayer_times" && (
				<ScreenContent
					type={current.type as ContentKind}
					maxItems={current.max_items ?? 5}
					itemIndex={itemIndex}
					language={language}
					fallback={fallback}
					timezone={timezone}
					showClock={settings.show_clock !== false}
					refresh={refresh}
				/>
			)}
		</div>
	);
}
function PrayerTimesPage() {
	const {
		prayerTimes,
		tomorrowPrayerTimes,
		settings: initialSettings,
	} = useLoaderData({
		from: "/",
	});
	const router = useRouter();
	const { data: settings = initialSettings, isError } = useQuery({
		...screenConfigQueryOptions(),
		initialData: initialSettings,
		refetchInterval: (query) =>
			Math.max(1, query.state.data?.refresh_interval_seconds ?? 60) * 1000,
	});
	const timezone = settings?.timezone || "Europe/Berlin";
	setDisplayTimezone(timezone);
	useEffect(() => {
		const interval = setInterval(
			() => {
				void router.invalidate();
			},
			Math.max(1, settings?.refresh_interval_seconds ?? 60) * 1000,
		);
		return () => clearInterval(interval);
	}, [router, settings?.refresh_interval_seconds]);
	useEffect(() => {
		let date = calendarDate(timezone);
		const timer = setInterval(() => {
			const current = calendarDate(timezone);
			if (current !== date) {
				date = current;
				void router.invalidate();
			}
		}, 1000);
		return () => clearInterval(timer);
	}, [router, timezone]);
	return (
		<NextPrayerProvider
			prayerTimes={prayerTimes}
			tomorrowPrayerTimes={tomorrowPrayerTimes}
		>
			{isError && (
				<p className="screen-notice" role="alert">
					Bildschirm-Konfiguration nicht erreichbar.
				</p>
			)}
			<Playlist prayerTimes={prayerTimes} settings={settings ?? {}} />
		</NextPrayerProvider>
	);
}
export default PrayerTimesPage;
