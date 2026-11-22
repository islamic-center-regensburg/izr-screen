import type { CreateClientConfig } from "./generated/client.gen";

/**
 * Server-only runtime configuration for the generated Directus client.
 *
 * `client.gen.ts` (in `src/api/generated/`) loads this file via
 * `runtimeConfigPath` (see openapi-ts.config.ts) and calls it once on
 * client init. Every generated SDK function in `src/api/generated/sdk.gen.ts`
 * imports that same client, so this module — and the read token it reads —
 * must never be reachable from client-bundled code.
 *
 * Query modules under `src/api/` enforce that by
 * only calling into `src/api/generated` from inside a `createServerFn()`
 * handler, never from top-level,
 * component-reachable code.
 */
export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	baseUrl: process.env.DIRECTUS_API_URL || "http://localhost:8055",
	auth: () => {
		const token = process.env.DIRECTUS_READ_TOKEN;
		return token ? `Bearer ${token}` : undefined;
	},
});
