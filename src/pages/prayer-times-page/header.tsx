import TickingHour from "./TickingHour";

interface HeaderProps {
	date?: string;
	date_hijri?: string;
}

function Header({ date, date_hijri }: HeaderProps) {
	return (
		<header className="mb-[1.5vh] flex rounded-xl bg-[#1a3a2e] px-[1.5vw] py-[1vh] text-white">
			{/* Dates on the left */}
			<div className="flex flex-2 items-center justify-center gap-[1vw] whitespace-nowrap text-[1.5vw] text-white font-bold">
				Greg. {date && <p>{date}</p>}
				Hij. {date_hijri && <p>{date_hijri}</p>}
			</div>
			<div className="flex flex-col flex-1 justify-center items-center">
				<img
					src="/IZR_BRANDING.png"
					alt="Mosque Logo"
					className="h-auto w-[15vw]"
				/>
			</div>
			{/* Mosque name in the center */}
			<div className="flex flex-2 text-center items-center justify-center">
				<TickingHour />
			</div>
			{/* Logo on the right */}
		</header>
	);
}

export default Header;
