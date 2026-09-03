"use server";

import { revalidatePath } from "next/cache";
import { requireTraveller } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { wishlistListingSchema } from "@/lib/validation/booking";

export async function addWishlistItem(input: unknown) {
  const traveller = await requireTraveller();
  const { listingId } = wishlistListingSchema.parse(input);
  const listing = await prisma.listing.findFirst({ where: { id: listingId, isPublished: true }, select: { id: true } });
  if (!listing) throw new Error("Listing not found.");
  const item = await prisma.wishlistItem.upsert({
    where: { travellerId_listingId: { travellerId: traveller.id, listingId: listing.id } },
    update: {},
    create: { traveller: { connect: { id: traveller.id } }, listing: { connect: { id: listing.id } } },
  });
  revalidatePath("/dashboard");
  return item;
}

export async function removeWishlistItem(input: unknown) {
  const traveller = await requireTraveller();
  const { listingId } = wishlistListingSchema.parse(input);
  await prisma.wishlistItem.deleteMany({ where: { travellerId: traveller.id, listingId } });
  revalidatePath("/dashboard");
}

export async function listWishlistItems() {
  const traveller = await requireTraveller();
  return prisma.wishlistItem.findMany({ where: { travellerId: traveller.id }, orderBy: { createdAt: "desc" }, include: { listing: true } });
}
