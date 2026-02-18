interface HeaderProps {
	mosqueName?: string;
	date?: string;
	date_hijri?: string;
}

function Header({ mosqueName, date, date_hijri }: HeaderProps) {
	return (
		<header className="mb-[1.5vh] flex rounded-xl bg-[#1a3a2e] px-[1.5vw] py-[1vh] text-white">
			{/* Dates on the left */}
			<div className="flex flex-2 items-center justify-center gap-[1vw] whitespace-nowrap">
				Greg.{" "}
				{date && <p className="text-[1.5vw] text-white font-bold">{date}</p>}
				Hij.{" "}
				{date_hijri && (
					<p className="text-[1.5vw] text-white font-bold">{date_hijri}</p>
				)}
			</div>
			<div className="flex flex-1 justify-center">
				<img
					src="/IZR_LOGO_ROUND_WHITE_BG.png"
					alt="Mosque Logo"
					className="h-[10vh] w-auto"
				/>
			</div>
			{/* Mosque name in the center */}
			<div className="flex flex-2 text-center items-center justify-center">
				<h1 className="text-[2vw] font-bold">{mosqueName}</h1>
			</div>
			{/* Logo on the right */}
		</header>
	);
}

export default Header;
