import { z } from "zod";

const id = z.string().cuid("Invalid record identifier.");

export const createBookingRequestSchema = z.object({
  listingId: id,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  guests: z.coerce.number().int().positive().max(100).optional(),
  travellerMessage: z.string().trim().max(2_000).optional(),
}).refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
  message: "End date must be after the start date.",
  path: ["endDate"],
});

export const bookingRequestIdSchema = z.object({ bookingRequestId: id });
export const wishlistListingSchema = z.object({ listingId: id });

export const sendMessageSchema = z.object({
  bookingRequestId: id.optional(),
  listingId: id.optional(),
  recipientId: id,
  content: z.string().trim().min(1, "Message cannot be empty.").max(4_000),
}).refine((data) => Boolean(data.bookingRequestId) !== Boolean(data.listingId), {
  message: "A message must belong to one booking request or one listing.",
});

export const listMessagesSchema = z.object({
  bookingRequestId: id.optional(),
  listingId: id.optional(),
}).refine((data) => Boolean(data.bookingRequestId) !== Boolean(data.listingId), {
  message: "Choose one message thread.",
});
