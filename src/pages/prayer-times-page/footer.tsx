import { Crosshair, Globe, MapPin, Phone } from "lucide-react";

interface FooterProps {
	address?: string;
	city?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
}

function Footer({ address, city, country, latitude, longitude }: FooterProps) {
	return (
		<footer className="mt-[1.5vh] pt-[1vh] text-center text-[1.2vw] text-muted-foreground">
			<div className="flex flex-wrap items-center justify-center gap-[1vw]">
				<div className="flex items-center gap-[0.5vw]">
					<MapPin size="1.2vw" />
					<span>{address}</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<Globe size="1.2vw" />
					<span>
						{city}, {country}
					</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<Crosshair size="1.2vw" />
					<span>Lat: {latitude?.toFixed(4)}</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<Crosshair size="1.2vw" />
					<span>Lon: {longitude?.toFixed(4)}</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<Globe size="1.2vw" />
					<span>iz-regensburg.de</span>
				</div>
				<span>•</span>
				<div className="flex items-center gap-[0.5vw]">
					<Phone size="1.2vw" />
					<span>017660800940</span>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
