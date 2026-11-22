import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";
import { screenConfigQueryOptions } from "@/api/collections/screen-config/queries";
import type { ItemsScreenConfig } from "@/api/generated/types.gen";

// Legacy route components only need to know whether automatic transitions run.
type CmsScreenConfig = ItemsScreenConfig & {
	mode?: string;
	manual_section?: number | null;
	manual_language?: string;
};
const ScreenConfigContext = createContext<{
	isManual: boolean;
	config?: CmsScreenConfig;
}>({ isManual: false });
export function ScreenConfigProvider({ children }: { children: ReactNode }) {
	const { data } = useQuery(screenConfigQueryOptions());
	const config = data as CmsScreenConfig | undefined;
	return (
		<ScreenConfigContext.Provider
			value={{ isManual: config?.mode === "manual", config }}
		>
			{children}
		</ScreenConfigContext.Provider>
	);
}
export function useScreenConfig() {
	return useContext(ScreenConfigContext);
}
