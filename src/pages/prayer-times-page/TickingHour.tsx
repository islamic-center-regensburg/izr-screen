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
		<span className="absolute right-0 mx-5 bg-primary text-white font-black p-2 rounded-2xl min-w-28 text-[2vw]">
			{hours}:{minutes}:{seconds}
		</span>
	);
}

export default TickingHour;
