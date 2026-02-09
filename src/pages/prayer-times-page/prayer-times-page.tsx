import { useQuery } from "@tanstack/react-query";
import { getPrayerTimesForMosqueQueryOptions } from "@/api/prayer_times/queries";
import { useMosque } from "@/contexts";
import Footer from "./footer";
import Header from "./header";
import PrayerTimesGrid from "./prayer-times-grid";

function PrayerTimesPage() {
	const { mosque } = useMosque();
	const { data: prayerTimes, isLoading } = useQuery(
		getPrayerTimesForMosqueQueryOptions({
			mosque_id: mosque?.id || "",
			query: {
				year: new Date().getFullYear(),
				month: new Date().getMonth() + 1,
				day: new Date().getDate(),
				source: "stored",
			},
		}),
	);

	const todayPrayerTimes = prayerTimes ? prayerTimes[0] : null;

	if (isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen w-screen flex-col bg-background p-[2vw]">
			<Header
				mosqueName={mosque?.name}
				date={todayPrayerTimes?.gregorian_date}
				date_hijri={todayPrayerTimes?.hijri_date}
			/>

			<PrayerTimesGrid prayerTimes={todayPrayerTimes} />

			<Footer
				address={mosque?.address}
				city={mosque?.city}
				country={mosque?.country}
				latitude={mosque?.latitude}
				longitude={mosque?.longitude}
			/>
		</div>
	);
}

export default PrayerTimesPage;
