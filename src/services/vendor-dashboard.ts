import { requireVendor } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function getVendorDashboard() {
  const vendor = await requireVendor();
  const [profile, listings, bookingRequests, messages] = await Promise.all([
    prisma.vendorProfile.findUnique({ where: { userId: vendor.id } }),
    prisma.listing.findMany({ where: { ownerId: vendor.id }, orderBy: { updatedAt: "desc" } }),
    prisma.bookingRequest.findMany({ where: { listing: { ownerId: vendor.id } }, include: { listing: { select: { title: true } }, traveller: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.message.findMany({ where: { OR: [{ senderId: vendor.id }, { recipientId: vendor.id }] }, include: { sender: { select: { name: true, email: true } }, listing: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  return { vendor, profile, listings, bookingRequests, messages };
}
