"use server";

import { BookingRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireTraveller, requireVendor, AuthorizationError } from "@/lib/authorization";
import { assertBookingTransition } from "@/lib/booking-state-machine";
import { prisma } from "@/lib/prisma";
import { bookingRequestIdSchema, createBookingRequestSchema } from "@/lib/validation/booking";

const bookingWithOwner = { listing: { select: { ownerId: true } } } as const;

export async function createBookingRequest(input: unknown) {
  const traveller = await requireTraveller();
  const data = createBookingRequestSchema.parse(input);
  const listing = await prisma.listing.findFirst({ where: { id: data.listingId, isPublished: true }, select: { id: true } });
  if (!listing) throw new Error("This listing is not available for booking requests.");

  const request = await prisma.bookingRequest.create({
    data: {
      listing: { connect: { id: listing.id } },
      traveller: { connect: { id: traveller.id } },
      startDate: data.startDate,
      endDate: data.endDate,
      guests: data.guests,
      travellerMessage: data.travellerMessage,
    },
  });
  revalidatePath("/dashboard");
  return request;
}

async function getVendorBookingRequest(input: unknown) {
  const vendor = await requireVendor();
  const { bookingRequestId } = bookingRequestIdSchema.parse(input);
  const request = await prisma.bookingRequest.findUnique({ where: { id: bookingRequestId }, include: bookingWithOwner });
  if (!request) throw new Error("Booking request not found.");
  if (request.listing.ownerId !== vendor.id) throw new AuthorizationError();
  return request;
}

export async function acceptBookingRequest(input: unknown) {
  const request = await getVendorBookingRequest(input);
  assertBookingTransition(request.status, BookingRequestStatus.accepted);
  const accepted = await prisma.$transaction(async (tx) => {
    const bookingRequest = await tx.bookingRequest.update({ where: { id: request.id }, data: { status: BookingRequestStatus.accepted } });
    await tx.trip.create({
      data: {
        bookingRequest: { connect: { id: bookingRequest.id } },
        traveller: { connect: { id: bookingRequest.travellerId } },
        startDate: bookingRequest.startDate,
        endDate: bookingRequest.endDate,
      },
    });
    return bookingRequest;
  });
  revalidatePath("/dashboard");
  return accepted;
}

export async function declineBookingRequest(input: unknown) {
  const request = await getVendorBookingRequest(input);
  assertBookingTransition(request.status, BookingRequestStatus.declined);
  const declined = await prisma.bookingRequest.update({ where: { id: request.id }, data: { status: BookingRequestStatus.declined } });
  revalidatePath("/dashboard");
  return declined;
}

export async function cancelBookingRequest(input: unknown) {
  const traveller = await requireTraveller();
  const { bookingRequestId } = bookingRequestIdSchema.parse(input);
  const request = await prisma.bookingRequest.findUnique({ where: { id: bookingRequestId } });
  if (!request) throw new Error("Booking request not found.");
  if (request.travellerId !== traveller.id) throw new AuthorizationError();
  assertBookingTransition(request.status, BookingRequestStatus.cancelled);
  const cancelled = await prisma.bookingRequest.update({ where: { id: request.id }, data: { status: BookingRequestStatus.cancelled } });
  revalidatePath("/dashboard");
  return cancelled;
}
