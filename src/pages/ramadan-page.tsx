import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

function RamadanPage() {
	const navigate = useNavigate();
	const [secondsLeft, setSecondsLeft] = useState(10);

	useEffect(() => {
		if (secondsLeft <= 0) {
			navigate({ to: "/" });
			return;
		}

		const intervalId = setInterval(() => {
			setSecondsLeft((previousSeconds) => previousSeconds - 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, [secondsLeft, navigate]);
	return (
		<div className="relative h-screen w-screen overflow-hidden bg-linear-to-br from-primary to-primary">
			<img
				alt="Ramadan moon"
				className="absolute top-2/3 left-[4vw] w-[20vw] -translate-y-1/2"
				src="/ramadan.png"
			/>

			<img
				alt="Ramadan lights"
				className="absolute top-[2vh] right-[2vw] w-[16vw]"
				src="/ramadan-lights.png"
			/>

			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<img
					alt="Ramadan Kareem"
					className="w-[40vw] max-w-200"
					src="/ramadan-kareem.png"
				/>
			</div>
		</div>
	);
}

export default RamadanPage;
