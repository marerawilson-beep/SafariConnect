import { BookingRequestStatus } from "@prisma/client";
import { requireTraveller } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function getTravellerDashboard() {
  const traveller = await requireTraveller();
  const [bookingRequests, trips, wishlist, messages] = await Promise.all([
    prisma.bookingRequest.findMany({ where: { travellerId: traveller.id }, orderBy: { createdAt: "desc" }, include: { listing: { select: { title: true, location: true, slug: true } } } }),
    prisma.trip.findMany({ where: { travellerId: traveller.id }, orderBy: { startDate: "asc" }, include: { bookingRequest: { include: { listing: { select: { title: true, location: true } } } } } }),
    prisma.wishlistItem.findMany({ where: { travellerId: traveller.id }, orderBy: { createdAt: "desc" }, include: { listing: { select: { title: true, location: true, slug: true, priceFrom: true, currency: true } } } }),
    prisma.message.findMany({ where: { OR: [{ senderId: traveller.id }, { recipientId: traveller.id }] }, orderBy: { createdAt: "desc" }, take: 12, include: { sender: { select: { name: true } }, recipient: { select: { name: true } }, listing: { select: { title: true } } } }),
  ]);

  return {
    traveller,
    requestsByStatus: {
      pending: bookingRequests.filter((request) => request.status === BookingRequestStatus.pending),
      accepted: bookingRequests.filter((request) => request.status === BookingRequestStatus.accepted),
      declined: bookingRequests.filter((request) => request.status === BookingRequestStatus.declined),
      cancelled: bookingRequests.filter((request) => request.status === BookingRequestStatus.cancelled),
    },
    trips,
    wishlist,
    messages,
  };
}
