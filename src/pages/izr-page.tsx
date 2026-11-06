import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useScreenConfig } from "@/contexts/screen-config-context";

function IZRPage() {
	const navigate = useNavigate();
	const { isManual } = useScreenConfig();
	const [secondsLeft, setSecondsLeft] = useState(10);

	useEffect(() => {
		if (isManual) return;
		if (secondsLeft <= 0) {
			navigate({ to: "/" });
			return;
		}

		const intervalId = setInterval(() => {
			setSecondsLeft((previousSeconds) => previousSeconds - 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, [secondsLeft, navigate, isManual]);

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background px-6 py-10 text-foreground">
			<img
				alt="IZR Branding"
				className="h-auto w-full rounded-xl"
				src="/izr-golden-logo.svg"
			/>
		</div>
	);
}

export default IZRPage;
