import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getAllPrayerIqamas,
	type PaginatedResponsePrayerIqamaOut,
	type PrayerName,
} from "@/api/gen";

export default function usePrayerIqama(prayerName: PrayerName) {
	const [iqamaData, setIqamaData] =
		useState<PaginatedResponsePrayerIqamaOut | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchIqama = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await getAllPrayerIqamas({
				query: { prayer_name: prayerName },
			});
			if (!response.data) {
				throw new Error("Keine Iqama-Daten zurückgegeben");
			}
			setIqamaData(response.data);
		} catch (fetchError) {
			setError(fetchError as Error);
			setIqamaData(null);
		} finally {
			setIsLoading(false);
		}
	}, [prayerName]);

	useEffect(() => {
		void fetchIqama();
	}, [fetchIqama]);

	const prayerIqama = useMemo(() => {
		return iqamaData?.data[0];
	}, [iqamaData]);

	return { prayerIqama, isLoading, error, refetch: fetchIqama };
}
