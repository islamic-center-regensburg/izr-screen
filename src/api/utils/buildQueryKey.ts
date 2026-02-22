export const buildQueryKey = (
	baseKey: string,
	queryObj?: Record<string, unknown>,
) => {
	if (!queryObj) return [baseKey];

	const queryEntries = Object.entries(queryObj)
		.filter(([, value]) => value !== null && value !== undefined)
		.map(([key, value]) => `${key}: ${value}`);

	return [baseKey, ...queryEntries];
};

export const buildQueryKeyWithPath = (
	baseKey: string,
	{ path, value }: { path: string; value: string },
	queryObj?: Record<string, unknown>,
) => {
	if (!queryObj) return [baseKey, `/{${path}}: ${value}`];

	const queryEntries = Object.entries(queryObj)
		.filter(([, value]) => value !== null && value !== undefined)
		.map(([key, value]) => `${key}: ${value}`);

	return [baseKey, `/{${path}}: ${value}`, ...queryEntries];
};
