import { useLoaderData, useNavigate } from "@tanstack/react-router";
import AutomaticDashboard from "@/components/automatic-dashboard";
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
			<AutomaticDashboard prayerTimes={todayPrayerTimes} />
			<div className="prayer-screen">
				<div className="prayer-screen__wash" aria-hidden="true" />
				<div className="prayer-screen__content">
					<Header
						date={todayPrayerTimes?.gregorian_date}
						date_hijri={todayPrayerTimes?.hijri_date}
					/>
					<PrayerTimesGrid prayerTimes={todayPrayerTimes} />
					<Footer address={mosque?.address} />
				</div>
			</div>
		</NextPrayerProvider>
	);
}

export default PrayerTimesPage;
