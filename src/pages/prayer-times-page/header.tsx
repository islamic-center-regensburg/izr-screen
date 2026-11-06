import TickingHour from "./TickingHour";

interface HeaderProps {
	date?: string;
	date_hijri?: string;
}

function Header({ date, date_hijri }: HeaderProps) {
	return (
		<header className="prayer-header">
			<div className="prayer-header__date">
				<span className="prayer-eyebrow">Gregorianisches Datum</span>
				<strong>{date || "—"}</strong>
				<span className="prayer-header__hijri">Hijri {date_hijri || "—"}</span>
			</div>
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
			<div className="prayer-header__clock">
				<span className="prayer-header__live" aria-hidden="true" />
				<TickingHour />
			</div>
		</header>
	);
}

export default Header;
