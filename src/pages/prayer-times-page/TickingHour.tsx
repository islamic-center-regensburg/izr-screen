import { useEffect, useState } from "react";

function pad(num: number): string {
	return num.toString().padStart(2, "0");
}

function TickingHour() {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const hours = pad(now.getHours());
	const minutes = pad(now.getMinutes());
	const seconds = pad(now.getSeconds());

	return (
		<time className="prayer-clock" dateTime={now.toTimeString().slice(0, 8)}>
			{hours}:{minutes}:{seconds}
		</time>
	);
}

export default TickingHour;
