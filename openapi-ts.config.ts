import type { UserConfig } from "@hey-api/openapi-ts";

/**
 * OpenAPI TypeScript code generator configuration for the Directus (izr-cms)
 * backend.
 *
 * Generates, from the Directus OpenAPI spec:
 * - TypeScript types for every collection (`@hey-api/typescript`)
 * - A typed fetch client + SDK functions, one per operation (`@hey-api/sdk`)
 * - Zod schemas for runtime response validation (`zod`)
 *
 * Output lives in `src/api/generated/`; never edit it by hand — fix this
 * config or the source spec instead, then regenerate with `npm run api:generate`.
 */

// Collections exposed under /items/*, used below to patch every single-item
// ("/items/{collection}/{id}") GET operation.
const ITEM_COLLECTIONS = [
	"news",
	"news_translations",
	"events",
	"events_translations",
	"languages",
	"screen_config",
	"screen_sections",
	"campaigns",
	"campaigns_translations",
	"donations",
	"prayer_times",
	"iqama_times",
];

// Directus's spec declares `security` on list operations (`GET /items/x`)
// but omits it on single-item ones (`GET /items/x/{id}`), even though both
// require the exact same bearer auth in practice — confirmed empirically:
// the generated client sends no Authorization header for single-item reads
// and Directus rejects them with a permission error. `patch.operations`
// only matches exact "METHOD /path" keys (no wildcards), so we build the
// full set of single-item keys here instead of hand-writing all 12.
const addMissingAuthSecurity = (operation: { security?: unknown }) => {
	operation.security ??= [{ Auth: [] }];
};

export default {
	// Directus's OpenAPI spec is permission-scoped: an unauthenticated
	// request only reveals /auth/* and /server/* paths. The read token must
	// be sent so the spec includes the /items/{collection} paths that token
	// can access. OPENAPI_INPUT overrides the default local Directus URL.
	input: {
		path: process.env.OPENAPI_INPUT || "http://localhost:8055/server/specs/oas",
		fetch: {
			headers: process.env.DIRECTUS_READ_TOKEN
				? { Authorization: `Bearer ${process.env.DIRECTUS_READ_TOKEN}` }
				: undefined,
		},
	},

	output: {
		path: "src/api/generated",
		postProcess: ["prettier"],
	},

	// === CRITICAL: Filter to only collection endpoints ===
	// Filters are applied during parsing, before any plugin runs. Directus
	// does not expose a literal "/items/{collection}" path — it generates
	// one concrete path per collection (e.g. /items/news, /items/events/{id}).
	// A regex (wrapped in "/.../") matches every GET operation under
	// /items/*, both list and by-id, while excluding write methods and all
	// non-collection endpoints (auth, server, assets).
	parser: {
		filters: {
			operations: {
				include: ["/^GET \\/items\\//"],
			},
		},
		patch: {
			schemas: {
				// Directus declares decimal fields (campaigns.target_amount,
				// donations.amount) as OpenAPI "number", but the live API
				// actually returns them as JSON strings (e.g. "250.00") —
				// see the Directus schema. Left as-is, the generated Zod
				// schema (z.number()) would reject every real response.
				// Patch the spec so both the TS type and the Zod schema
				// expect a string instead.
				ItemsCampaigns: (schema) => {
					const targetAmount = schema.properties?.target_amount;
					if (targetAmount && typeof targetAmount === "object" && !("$ref" in targetAmount)) {
						targetAmount.type = "string";
					}
				},
				ItemsDonations: (schema) => {
					const amount = schema.properties?.amount;
					if (amount && typeof amount === "object" && !("$ref" in amount)) {
						amount.type = "string";
					}
				},
			},
			// Directus declares `filter` as a `content: application/json`
			// parameter (its value is a JSON-encoded object), but hey-api's
			// generated querySerializer defaults nested-object params to
			// OpenAPI "form" style, which only knows how to serialize flat
			// primitives and throws ("Deeply-nested arrays/objects aren't
			// supported") the moment a filter value is itself an object —
			// i.e. on every real Directus filter (`{ status: { _eq: ... } }`).
			// Rewriting it as a plain string parameter sidesteps that
			// serializer entirely; collection queries pass `JSON.stringify(filter)`.
			parameters: {
				Filter: (parameter) => {
					if ("$ref" in parameter) return;
					if ("content" in parameter) {
						delete parameter.content;
					}
					parameter.schema = { type: "string" };
				},
			},
			operations: Object.fromEntries(
				ITEM_COLLECTIONS.map((collection) => [
					`GET /items/${collection}/{id}`,
					addMissingAuthSecurity,
				]),
			),
		},
	},

	plugins: [
		// Runtime fetch client used by the generated SDK functions.
		// `runtimeConfigPath` wires in src/api/runtime-config.ts, which
		// supplies the base URL and the server-only read token.
		{
			name: "@hey-api/client-fetch",
			runtimeConfigPath: "../runtime-config",
		},
		{
			name: "@hey-api/typescript",
			enums: "typescript",
		},
		{
			name: "@hey-api/sdk",
			// Validate responses against the generated Zod schemas at
			// runtime. Directus's declared types don't always match live
			// responses exactly (see the Directus schema), so this
			// catches shape drift early instead of failing silently later.
			validator: {
				request: false,
				response: "zod",
			},
		},
		{
			name: "zod",
			// Zod 4 schemas for every request/response shape, reusable at
			// runtime for both SDK response validation above and manual
			// parsing in collection query modules.
			compatibilityVersion: 4,
		},
	],

	logs: {
		level: process.env.OPENAPI_VERBOSE === "true" ? "debug" : "info",
	},
} satisfies UserConfig;
