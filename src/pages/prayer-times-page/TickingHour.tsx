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
		<span className="text-[3vw] font-bold">
			{hours}:{minutes}:{seconds}
		</span>
	);
}

export default TickingHour;
