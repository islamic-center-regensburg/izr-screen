import { Globe, Landmark, Phone } from "lucide-react";

function Footer() {
	return (
		<footer className="prayer-footer">
			<div className="prayer-footer__item">
				<Landmark aria-hidden="true" />
				<span>IBAN: DE30 7505 0000 0026 7651 56</span>
			</div>
			<div className="prayer-footer__item">
				<Globe aria-hidden="true" />
				<a href="https://iz-regensburg.de">iz-regensburg.de</a>
			</div>
			<div className="prayer-footer__item">
				<Phone aria-hidden="true" />
				<span>017660800940</span>
			</div>
		</footer>
	);
}

export default Footer;
