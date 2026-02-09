interface FooterProps {
	address?: string;
	city?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
}

function Footer({ address, city, country, latitude, longitude }: FooterProps) {
	return (
		<footer className="mt-[1.5vh] border-t border-border pt-[1vh] text-center text-[1.2vw] text-muted-foreground">
			<div className="flex flex-wrap items-center justify-center gap-[1vw]">
				<span>{address}</span>
				<span>•</span>
				<span>
					{city}, {country}
				</span>
				<span>•</span>
				<span>Lat: {latitude?.toFixed(4)}</span>
				<span>•</span>
				<span>Lon: {longitude?.toFixed(4)}</span>
			</div>
		</footer>
	);
}

export default Footer;
