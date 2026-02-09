interface HeaderProps {
	mosqueName?: string;
	date?: string;
	date_hijri?: string;
}

function Header({ mosqueName, date, date_hijri }: HeaderProps) {
	return (
		<header className="mb-[1.5vh] flex items-center justify-between">
			{/* Logo on the left */}
			<div className="flex-shrink-0">
				<img
					src="/IZR_LOGO_ROUND_WHITE_BG.png"
					alt="Mosque Logo"
					className="h-[8vh] w-auto"
				/>
			</div>

			{/* Mosque name in the center */}
			<div className="flex-1 text-center">
				<h1 className="text-[3vw] font-bold">{mosqueName}</h1>
			</div>

			{/* Dates on the right */}
			<div className="flex-shrink-0 text-right">
				{date && <p className="text-[1.5vw] text-muted-foreground">{date}</p>}
				{date_hijri && (
					<p className="text-[1.5vw] text-muted-foreground">{date_hijri}</p>
				)}
			</div>
		</header>
	);
}

export default Header;
