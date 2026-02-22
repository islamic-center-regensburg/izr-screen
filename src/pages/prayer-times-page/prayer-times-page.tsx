import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { NextPrayerProvider, useMosque } from "@/contexts";
import Footer from "./footer";
import Header from "./header";
import PrayerTimesGrid from "./prayer-times-grid";

function PrayerTimesPage() {
	const navigate = useNavigate();
	const { prayerTimes: todayPrayerTimes } = useLoaderData({
		from: "/",
	});

	if (!todayPrayerTimes) {
		navigate({ to: "/problem" });
	}

	const { mosque } = useMosque();

	return (
		<NextPrayerProvider prayerTimes={todayPrayerTimes}>
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
		</NextPrayerProvider>
	);
}

export default PrayerTimesPage;
