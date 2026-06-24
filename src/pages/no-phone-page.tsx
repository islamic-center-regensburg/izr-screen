import { useNavigate, useParams } from "@tanstack/react-router";
import { PhoneOff } from "lucide-react";
import { useEffect } from "react";

function NoPhonePage() {
	const navigate = useNavigate();
	const { countdown } = useParams({ from: "/no-phone/$countdown" });

	useEffect(() => {
		const timeoutId = setTimeout(
			() => {
				navigate({ to: "/izr" });
			},
			(countdown ? parseInt(countdown, 10) : 10) * 60 * 1000,
		);

		return () => clearTimeout(timeoutId);
	}, [navigate, countdown]);

	return (
		<div className="w-screen h-screen flex items-center justify-center">
			<div className="flex rounded-4xl items-center justify-center text-foreground p-[1vw] glass-bg">
				<div className="max-w-5xl text-center w-full">
					<div className="mx-auto flex h-[clamp(2rem,22vw,18rem)] w-[clamp(2rem,22vw,18rem)] border-black items-center justify-center rounded-full border-[clamp(3px,0.8vw,8px)]">
						<PhoneOff
							className="h-[clamp(3rem,14vw,11rem)] w-[clamp(3rem,14vw,11rem)] text-black"
							strokeWidth={1}
						/>
					</div>

					<div className="mt-[clamp(1rem,3vw,2rem)] space-y-[clamp(0.5rem,1.5vw,1.25rem)] ">
						<p className="font-semibold leading-snug text-[clamp(0.875rem,2.5vw,1.875rem)]">
							Bitte Handy auf lautlos stellen und während des Gebets leise sein.
						</p>
						<p className="font-semibold leading-snug text-[clamp(0.875rem,2.5vw,1.875rem)]">
							Please put your phone on silent and keep quiet while praying.
						</p>
						<h2
							className="leading-snug font-semibold text-[clamp(0.875rem,2.5vw,1.875rem)]"
							dir="rtl"
						>
							يرجى وضع الهاتف على الوضع الصامت والالتزام بالهدوء أثناء الصلاة
						</h2>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NoPhonePage;
