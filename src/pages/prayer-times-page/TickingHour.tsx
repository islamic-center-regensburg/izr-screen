import { useEffect, useState } from "react";

function TickingHour({ timezone }: { timezone?: string }) {
	const [now, setNow] = useState(new Date());
	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(interval);
	}, []);
	const text = new Intl.DateTimeFormat("en-GB", {
		timeZone: timezone,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).format(now);
	return (
		<time className="prayer-clock" dateTime={now.toISOString()}>
			{text}
		</time>
	);
}
export default TickingHour;
