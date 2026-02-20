import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Home, RotateCw } from "lucide-react";

function ProblemPage() {
	const navigate = useNavigate();

	const handleHome = () => {
		navigate({ to: "/" });
	};

	const handleRetry = () => {
		navigate({ to: "/" });
	};

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-linear-to-br from-background to-background/80 p-[2vw]">
			<div className="flex max-w-[80vw] flex-col items-center justify-center gap-[2vh] rounded-2xl border border-destructive/20 bg-destructive/5 p-[4vw] text-center backdrop-blur-sm">
				<div className="flex items-center justify-center gap-[1vw]">
					<AlertCircle size="3vw" className="text-destructive" />
					<h1 className="text-[3vw] font-bold text-destructive">Fehler</h1>
				</div>

				<p className="text-[1.5vw] text-muted-foreground">
					Die Gebetszeiten konnten nicht geladen werden.
				</p>

				<p className="text-[1vw] text-muted-foreground">
					Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es
					später erneut.
				</p>

				<div className="mt-[2vh] flex flex-wrap items-center justify-center gap-[1vw]">
					<button
						type="button"
						onClick={handleRetry}
						className="flex items-center justify-center gap-[0.5vw] rounded-lg bg-primary px-[2vw] py-[1vh] text-[1.2vw] font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
					>
						<RotateCw size="1.5vw" />
						Erneut versuchen
					</button>

					<button
						type="button"
						onClick={handleHome}
						className="flex items-center justify-center gap-[0.5vw] rounded-lg border border-muted bg-transparent px-[2vw] py-[1vh] text-[1.2vw] font-semibold text-foreground transition-all hover:bg-muted/50 active:scale-95"
					>
						<Home size="1.5vw" />
						Zurück zur Startseite
					</button>
				</div>

				<div className="mt-[2vh] rounded-lg bg-muted/50 p-[1.5vw] text-left">
					<p className="text-[0.9vw] text-muted-foreground">
						<span className="font-semibold">Fehlercode:</span>{" "}
						LOAD_PRAYER_TIMES_FAILED
					</p>
					<p className="mt-[0.5vh] text-[0.9vw] text-muted-foreground">
						Wenn das Problem weiterhin besteht, kontaktieren Sie bitte den
						Support.
					</p>
				</div>
			</div>
		</div>
	);
}

export default ProblemPage;
