import { MapPin, Phone } from "lucide-react";
import TickingHour from "./TickingHour";

interface FooterProps {
	address?: string;
}

function Footer({ address }: FooterProps) {
	return (
		<footer className="mt-[1.5vh] pt-[1vh] text-center text-[1.2vw] text-muted-foreground">
			<div className="flex flex-wrap items-center justify-center gap-[1vw]">
				<div className="flex items-center gap-[0.5vw]">
					<MapPin size="1.2vw" />
					<span>{address}</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<span>IBAN: DE30 7505 0000 0026 7651 56</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<span>iz-regensburg.de</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<Phone size="1.2vw" />
					<span>017660800940</span>
				</div>
				<TickingHour />
			</div>
		</footer>
	);
}

export default Footer;
