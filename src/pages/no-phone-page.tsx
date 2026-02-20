import { useNavigate, useParams } from "@tanstack/react-router";
import { PhoneOff } from "lucide-react";
import { useEffect } from "react";

function NoPhonePage() {
	const navigate = useNavigate();
	const { countdown } = useParams({ from: "/no-phone/$countdown" });

	useEffect(() => {
		const timeoutId = setTimeout(
			() => {
				navigate({ to: "/" });
			},
			(countdown ? parseInt(countdown, 10) : 10) * 60 * 1000,
		);

		return () => clearTimeout(timeoutId);
	}, [navigate, countdown]);

	return (
		<div className="flex h-screen w-screen items-center justify-center px-8 text-foreground bg-primary p-20">
			<div className="max-w-5xl text-center">
				<div className="mx-auto flex h-[clamp(10rem,22vw,18rem)] w-[clamp(10rem,22vw,18rem)] items-center justify-center rounded-full border-8 border-white">
					<PhoneOff
						className="text-white h-[clamp(6rem,14vw,11rem)] w-[clamp(6rem,14vw,11rem)]"
						strokeWidth={1}
					/>
				</div>

				<div className="mt-8 space-y-5 text-white">
					<p className="font-semibold leading-snug text-3xl">
						Bitte Handy auf lautlos stellen und während des Gebets leise sein.
					</p>
					<p className="font-semibold leading-snug text-3xl">
						Please put your phone on silent and keep quiet while praying.
					</p>
					<p
						className="leading-snug text-3xl"
						dir="rtl"
						style={{ fontFamily: "Naveid" }}
					>
						يرجى وضع الهاتف على الوضع الصامت والالتزام بالهدوء أثناء الصلاة
					</p>
				</div>
			</div>
		</div>
	);
}

export default NoPhonePage;
