import TickingHour from "./TickingHour";

interface HeaderProps {
	date?: string;
	date_hijri?: string;
	showClock?: boolean;
	timezone?: string;
}

function Header({ date, date_hijri, showClock = true, timezone }: HeaderProps) {
	return (
		<header className="prayer-header">
			<div className="prayer-header__brand">
				<img
					src="/IZR_LOGO_ROUND_WHITE_BG.png"
					alt="Islamisches Zentrum Regensburg"
				/>
				<div>
					<span className="prayer-eyebrow">Islamisches Zentrum</span>
					<h1>Regensburg</h1>
				</div>
			</div>
			<div className="prayer-header__date">
				<span className="prayer-eyebrow">Heute / اليوم</span>
				<strong>
					{date && /^\d{4}-\d{2}-\d{2}$/.test(date)
						? date.split("-").reverse().join(".")
						: date || "—"}
				</strong>
				<span className="prayer-header__hijri">
					Hijri / هجري · {date_hijri || "—"}
				</span>
			</div>
			{showClock && (
				<div className="prayer-header__clock">
					<span className="prayer-eyebrow">Uhrzeit / الوقت</span>
					<TickingHour timezone={timezone} />
				</div>
			)}
		</header>
	);
}

export default Header;
