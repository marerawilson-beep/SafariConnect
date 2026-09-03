import { ListingStatus, ReportStatus, ReviewModerationStatus, VendorVerificationStatus } from "@prisma/client";
import { requireAdministrator } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  await requireAdministrator();
  const [vendors, listings, reports, reviews] = await Promise.all([
    prisma.vendorProfile.findMany({ where: { verificationStatus: VendorVerificationStatus.pending }, include: { user: { select: { name: true, email: true } } }, orderBy: { submittedAt: "asc" } }),
    prisma.listing.findMany({ where: { status: ListingStatus.submitted }, include: { owner: { select: { name: true, email: true } } }, orderBy: { updatedAt: "asc" } }),
    prisma.report.findMany({ where: { status: ReportStatus.pending }, include: { reporter: { select: { name: true, email: true } }, listing: { select: { title: true } }, review: { select: { content: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.review.findMany({ where: { moderationStatus: ReviewModerationStatus.pending }, include: { listing: { select: { title: true } }, traveller: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" } }),
  ]);
  return { vendors, listings, reports, reviews };
}
