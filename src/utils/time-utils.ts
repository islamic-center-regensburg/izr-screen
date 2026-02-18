interface NowProps {
	offsetMinutes?: number;
	baseTime?: Date;
}

export const nowTime = ({ offsetMinutes = 0, baseTime }: NowProps): Date => {
	const now = baseTime ?? new Date();
	if (!Number.isFinite(offsetMinutes) || offsetMinutes === 0) {
		return new Date(now.getTime());
	}
	return new Date(now.getTime() + offsetMinutes * 60 * 1000);
};
