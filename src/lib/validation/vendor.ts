import { z } from "zod";

const id = z.string().cuid();

export const vendorProfileSchema = z.object({ businessName: z.string().trim().min(2).max(160), description: z.string().trim().min(20).max(4000), contactEmail: z.string().email(), contactPhone: z.string().trim().min(5).max(40), address: z.string().trim().min(2).max(240) });
export const listingDraftSchema = z.object({ id: id.optional(), type: z.enum(["accommodation", "tour", "activity", "restaurant"]), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: z.string().trim().min(2).max(160), description: z.string().trim().min(20).max(5000), location: z.string().trim().min(2).max(160), priceFrom: z.coerce.number().nonnegative(), currency: z.string().trim().length(3).default("KES") });
export const recordIdSchema = z.object({ id });
