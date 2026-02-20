import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

function IZRPage() {
	const navigate = useNavigate();
	const [secondsLeft, setSecondsLeft] = useState(10);

	useEffect(() => {
		if (secondsLeft <= 0) {
			navigate({ to: "/ramadan" });
			return;
		}

		const intervalId = setInterval(() => {
			setSecondsLeft((previousSeconds) => previousSeconds - 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, [secondsLeft, navigate]);

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background px-6 py-10 text-foreground">
			<img
				alt="IZR Branding"
				className="h-auto w-full rounded-xl"
				src="/IZR_BRANDING.png"
			/>
		</div>
	);
}

export default IZRPage;
