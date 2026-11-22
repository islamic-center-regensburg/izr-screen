type Totals = Record<string, { confirmed: number; pending: number }>;

const labels = {
	de: {
		received: "Erhalten",
		pending: "Zugesagt",
		goal: "Spendenziel",
		remaining: "Noch benötigt",
		funded: "des Ziels erhalten oder zugesagt",
		total: "Gesamt (erhalten + zugesagt)",
	},
	en: {
		received: "Received",
		pending: "Pledged",
		goal: "Fundraising goal",
		remaining: "Still needed",
		funded: "of goal received or pledged",
		total: "Total (received + pledged)",
	},
	ar: {
		received: "المستلم",
		pending: "المتعهد به",
		goal: "هدف التبرع",
		remaining: "المبلغ المتبقي",
		funded: "من الهدف مستلم أو متعهد به",
		total: "الإجمالي (المستلم + المتعهد به)",
	},
};

export default function CampaignProgress({
	totals,
	currency = "EUR",
	target,
	language,
}: {
	totals: Totals;
	currency?: string;
	target?: string | number | null;
	language: string;
}) {
	const l = labels[language as keyof typeof labels] ?? labels.de;
	const money = (value: number, code = currency) =>
		new Intl.NumberFormat(language, {
			style: "currency",
			currency: code,
			maximumFractionDigits: 2,
			numberingSystem: "latn",
		}).format(value);
	const { confirmed, pending } = totals[currency] ?? {
		confirmed: 0,
		pending: 0,
	};
	const total = confirmed + pending;
	const goal = Number(target);
	const hasGoal = Number.isFinite(goal) && goal > 0;
	const receivedWidth = hasGoal
		? Math.min(100, Math.max(0, (confirmed / goal) * 100))
		: 0;
	const pledgedWidth = hasGoal
		? Math.min(100 - receivedWidth, Math.max(0, (pending / goal) * 100))
		: 0;
	const percent = new Intl.NumberFormat(language, {
		style: "percent",
		maximumFractionDigits: 1,
		numberingSystem: "latn",
	});
	return (
		<section className="campaign-chart">
			{hasGoal && (
				<>
					<div className="campaign-chart__heading">
						<div>
							<strong className="campaign-chart__percentage">
								{percent.format(total / goal)}
							</strong>
							<span>{l.funded}</span>
						</div>
						<div className="campaign-chart__goal">
							<span>{l.goal}</span>
							<strong>{money(goal)}</strong>
						</div>
					</div>
					<div
						className="campaign-chart__track"
						role="img"
						aria-label={`${l.received}: ${money(confirmed)}; ${l.pending}: ${money(pending)}; ${l.goal}: ${money(goal)}`}
					>
						<span
							className="campaign-chart__received"
							style={{ width: `${receivedWidth}%` }}
						/>
						<span
							className="campaign-chart__pledged"
							style={{ width: `${pledgedWidth}%` }}
						/>
					</div>
				</>
			)}
			<div className="campaign-chart__legend">
				<div className="campaign-chart__stat">
					<span>{l.total}</span>
					<strong>{money(total)}</strong>
				</div>
				<div className="campaign-chart__stat">
					<span>
						<i className="campaign-chart__dot campaign-chart__dot--received" />
						{l.received}
					</span>
					<strong>{money(confirmed)}</strong>
				</div>
				<div className="campaign-chart__stat">
					<span>
						<i className="campaign-chart__dot campaign-chart__dot--pledged" />
						{l.pending}
					</span>
					<strong>{money(pending)}</strong>
				</div>
				{hasGoal && (
					<div className="campaign-chart__stat">
						<span>{l.remaining}</span>
						<strong>{money(Math.max(0, goal - total))}</strong>
					</div>
				)}
			</div>
			{Object.entries(totals)
				.filter(([code]) => code !== currency)
				.map(([code, total]) => (
					<div className="campaign-chart__other" key={code}>
						{l.received}: {money(total.confirmed, code)} · {l.pending}:{" "}
						{money(total.pending, code)}
					</div>
				))}
		</section>
	);
}
