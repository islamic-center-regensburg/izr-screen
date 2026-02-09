import { z } from "zod";

export const MosqueFormSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.min(3, "Name must be at least 3 characters"),
	address: z
		.string()
		.min(1, "Address is required")
		.min(5, "Address must be at least 5 characters"),
	city: z
		.string()
		.min(1, "City is required")
		.min(2, "City must be at least 2 characters"),
	country: z
		.string()
		.min(1, "Country is required")
		.min(2, "Country must be at least 2 characters"),
	latitude: z
		.number()
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	longitude: z
		.number()
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
	timezone: z
		.string()
		.min(1, "Timezone is required")
		.refine((tz) => {
			try {
				Intl.DateTimeFormat(undefined, { timeZone: tz });
				return true;
			} catch {
				return false;
			}
		}, "Invalid timezone format"),
});

export type MosqueFormData = z.infer<typeof MosqueFormSchema>;
