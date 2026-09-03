"use server";

import { ListingStatus, VendorVerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireVendor, AuthorizationError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { listingDraftSchema, recordIdSchema, vendorProfileSchema } from "@/lib/validation/vendor";

export async function saveVendorProfile(input: unknown) {
  const vendor = await requireVendor();
  const data = vendorProfileSchema.parse(input);
  const profile = await prisma.vendorProfile.upsert({ where: { userId: vendor.id }, update: data, create: { user: { connect: { id: vendor.id } }, ...data } });
  revalidatePath("/vendor/onboarding");
  return profile;
}

export async function submitVendorProfile() {
  const vendor = await requireVendor();
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: vendor.id } });
  if (!profile?.businessName || !profile.description || !profile.contactEmail || !profile.contactPhone || !profile.address) throw new Error("Complete every business detail before submitting for verification.");
  const updated = await prisma.vendorProfile.update({ where: { userId: vendor.id }, data: { verificationStatus: VendorVerificationStatus.pending, submittedAt: new Date() } });
  revalidatePath("/vendor"); revalidatePath("/vendor/onboarding");
  return updated;
}

export async function saveListingDraft(input: unknown) {
  const vendor = await requireVendor();
  const data = listingDraftSchema.parse(input);
  const { id, ...listing } = data;
  const result = id
    ? await prisma.listing.updateMany({ where: { id, ownerId: vendor.id, status: ListingStatus.draft }, data: listing })
    : await prisma.listing.create({ data: { ...listing, owner: { connect: { id: vendor.id } }, status: ListingStatus.draft } });
  if (typeof result === "object" && "count" in result && !result.count) throw new AuthorizationError();
  revalidatePath("/vendor"); revalidatePath("/vendor/onboarding");
  return result;
}

export async function submitListing(input: unknown) {
  const vendor = await requireVendor();
  const { id } = recordIdSchema.parse(input);
  const listing = await prisma.listing.findFirst({ where: { id, ownerId: vendor.id, status: ListingStatus.draft } });
  if (!listing) throw new Error("Only your draft listings can be submitted.");
  const submitted = await prisma.listing.update({ where: { id }, data: { status: ListingStatus.submitted, isPublished: false } });
  revalidatePath("/vendor");
  return submitted;
}
