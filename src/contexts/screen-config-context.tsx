import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	fetchScreenConfig,
	parseScreenConfig,
	SCREEN_CONFIG_POLL_INTERVAL,
	type ScreenConfig,
} from "@/api/screen-config";
import {
	buildDashboardUrl,
	getConfigKey,
	isManualMode,
} from "@/lib/screen-control";

const CONFIG_STORAGE_KEY = "izr:screenConfig";
const DASHBOARD_VISIT_KEY = "izr:dashboardVisit";

function readStorage(key: string): string | null {
	try {
		return sessionStorage.getItem(key);
	} catch (error) {
		console.error("Bildschirm-Sitzung konnte nicht gelesen werden:", error);
		return null;
	}
}

function writeStorage(key: string, value: string) {
	try {
		sessionStorage.setItem(key, value);
	} catch (error) {
		console.error("Bildschirm-Sitzung konnte nicht gespeichert werden:", error);
		throw error;
	}
}

function readCachedConfig(): ScreenConfig | undefined {
	const cached = readStorage(CONFIG_STORAGE_KEY);
	if (cached === null) return undefined;
	try {
		return parseScreenConfig(JSON.parse(cached));
	} catch (error) {
		console.error("Gespeicherte Bildschirm-Konfiguration ist ungültig:", error);
		return undefined;
	}
}

interface ScreenConfigContextValue {
	config: ScreenConfig | undefined;
	isManual: boolean;
	now: number;
	lastDashboardAt: number;
	openDashboard: () => void;
}

const ScreenConfigContext = createContext<ScreenConfigContextValue | undefined>(
	undefined,
);

export function ScreenConfigProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const [now, setNow] = useState(Date.now);
	const [lastDashboardAt, setLastDashboardAt] = useState(() => {
		const stored = Number(readStorage(DASHBOARD_VISIT_KEY));
		return stored > 0 && Number.isFinite(stored) ? stored : Date.now();
	});
	const [dashboardError, setDashboardError] = useState(false);
	const leaving = useRef(false);
	const wasManual = useRef(false);
	const { data: config, isError } = useQuery({
		queryKey: ["screen-config"],
		queryFn: ({ signal }) => fetchScreenConfig(signal),
		initialData: readCachedConfig,
		staleTime: 0,
		refetchInterval: SCREEN_CONFIG_POLL_INTERVAL,
		refetchIntervalInBackground: true,
		retry: false,
	});
	const isManual = isManualMode(config, now);
	const configKey = config ? getConfigKey(config) : null;

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!configKey) return;
		try {
			writeStorage(CONFIG_STORAGE_KEY, configKey);
		} catch {
			setDashboardError(true);
		}
	}, [configKey]);

	const openDashboard = useCallback(() => {
		if (!config || leaving.current) return;
		try {
			const callback = new URL(
				import.meta.env.BASE_URL,
				window.location.origin,
			);
			const url = buildDashboardUrl(config, callback.toString(), Date.now());
			const visitedAt = Date.now();
			writeStorage(DASHBOARD_VISIT_KEY, String(visitedAt));
			setLastDashboardAt(visitedAt);
			leaving.current = true;
			window.location.assign(url);
		} catch (error) {
			console.error("Dashboard konnte nicht geöffnet werden:", error);
			setDashboardError(true);
			leaving.current = false;
		}
	}, [config]);

	useEffect(() => {
		const resumedAutomatic = wasManual.current && !isManual;
		wasManual.current = isManual;
		if (isManual && config) {
			let target: "/" | "/izr" | "/ramadan" = "/";
			if (config.manual_view === "izr") {
				target = "/izr";
			} else if (config.manual_view === "ramadan") {
				target = "/ramadan";
			}
			if (pathname !== target && !(target === "/" && pathname === "/problem")) {
				void navigate({ to: target, replace: true });
			}
		} else if (resumedAutomatic) {
			void navigate({ to: "/", replace: true });
		}
	}, [config, isManual, navigate, pathname]);

	useEffect(() => {
		if (!isManual || config?.manual_view !== "dashboard" || pathname !== "/") {
			return;
		}
		const timer = setTimeout(() => {
			if (isManualMode(config, Date.now())) {
				openDashboard();
			}
		}, SCREEN_CONFIG_POLL_INTERVAL);
		return () => clearTimeout(timer);
	}, [configKey, isManual, openDashboard, pathname]);

	return (
		<ScreenConfigContext.Provider
			value={{ config, isManual, now, lastDashboardAt, openDashboard }}
		>
			{children}
			{(isError || dashboardError) && (
				<output className="fixed bottom-2 right-2 z-50 max-w-md rounded bg-destructive px-3 py-2 text-sm text-destructive-foreground">
					{dashboardError
						? "Dashboard-Steuerung fehlgeschlagen. Bitte Sitzungsspeicher und Dashboard-URL prüfen."
						: "Konfiguration nicht erreichbar. Letzte gültige Einstellung bleibt aktiv; erneuter Versuch alle 2 Sekunden."}
				</output>
			)}
		</ScreenConfigContext.Provider>
	);
}

export function useScreenConfig() {
	const context = useContext(ScreenConfigContext);
	if (!context) {
		throw new Error("useScreenConfig must be used within ScreenConfigProvider");
	}
	return context;
}
