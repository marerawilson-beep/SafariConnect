"use server";

import { ListingStatus, Prisma, ReportStatus, ReviewModerationStatus, VendorVerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdministrator } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { recordIdSchema } from "@/lib/validation/vendor";

type TransactionClient = Prisma.TransactionClient;

async function adminAction(action: string, targetType: string, targetId: string, change: (tx: TransactionClient, actorId: string) => Promise<void>) {
  const admin = await requireAdministrator();
  await prisma.$transaction(async (tx) => { await change(tx, admin.id); await tx.auditLog.create({ data: { actor: { connect: { id: admin.id } }, action, targetType, targetId } }); });
  revalidatePath("/admin");
}

export async function approveVendor(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("VENDOR_APPROVED", "VendorProfile", id, async (tx) => { await tx.vendorProfile.update({ where: { id }, data: { verificationStatus: VendorVerificationStatus.approved, reviewedAt: new Date() } }); }); }
export async function rejectVendor(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("VENDOR_REJECTED", "VendorProfile", id, async (tx) => { await tx.vendorProfile.update({ where: { id }, data: { verificationStatus: VendorVerificationStatus.rejected, reviewedAt: new Date() } }); }); }
export async function approveListing(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("LISTING_APPROVED", "Listing", id, async (tx) => { await tx.listing.update({ where: { id }, data: { status: ListingStatus.published, isPublished: true } }); }); }
export async function rejectListing(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("LISTING_REJECTED", "Listing", id, async (tx) => { await tx.listing.update({ where: { id }, data: { status: ListingStatus.rejected, isPublished: false } }); }); }
export async function resolveReport(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("REPORT_RESOLVED", "Report", id, async (tx) => { await tx.report.update({ where: { id }, data: { status: ReportStatus.resolved } }); }); }
export async function dismissReport(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("REPORT_DISMISSED", "Report", id, async (tx) => { await tx.report.update({ where: { id }, data: { status: ReportStatus.dismissed } }); }); }
export async function approveReview(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("REVIEW_APPROVED", "Review", id, async (tx) => { await tx.review.update({ where: { id }, data: { moderationStatus: ReviewModerationStatus.approved } }); }); }
export async function rejectReview(input: unknown) { const { id } = recordIdSchema.parse(input); await adminAction("REVIEW_REJECTED", "Review", id, async (tx) => { await tx.review.update({ where: { id }, data: { moderationStatus: ReviewModerationStatus.rejected } }); }); }
