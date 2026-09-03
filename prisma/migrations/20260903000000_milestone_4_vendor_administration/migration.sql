CREATE TYPE "VendorVerificationStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'submitted', 'published', 'rejected');
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE "ReviewModerationStatus" AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE "Listing" ADD COLUMN "status" "ListingStatus" NOT NULL DEFAULT 'draft';
UPDATE "Listing" SET "status" = CASE WHEN "isPublished" THEN 'published'::"ListingStatus" ELSE 'draft'::"ListingStatus" END;

CREATE TABLE "VendorProfile" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "businessName" TEXT, "description" TEXT, "contactEmail" TEXT, "contactPhone" TEXT, "address" TEXT, "verificationStatus" "VendorVerificationStatus" NOT NULL DEFAULT 'draft', "submittedAt" TIMESTAMP(3), "reviewedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Review" ("id" TEXT NOT NULL, "listingId" TEXT NOT NULL, "travellerId" TEXT NOT NULL, "rating" INTEGER NOT NULL, "content" TEXT NOT NULL, "moderationStatus" "ReviewModerationStatus" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Review_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Report" ("id" TEXT NOT NULL, "reporterId" TEXT NOT NULL, "listingId" TEXT, "reviewId" TEXT, "reason" TEXT NOT NULL, "status" "ReportStatus" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Report_pkey" PRIMARY KEY ("id"));
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL, "actorId" TEXT NOT NULL, "action" TEXT NOT NULL, "targetType" TEXT NOT NULL, "targetId" TEXT NOT NULL, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "VendorProfile_userId_key" ON "VendorProfile"("userId");
CREATE INDEX "VendorProfile_verificationStatus_idx" ON "VendorProfile"("verificationStatus");
CREATE UNIQUE INDEX "Review_listingId_travellerId_key" ON "Review"("listingId", "travellerId");
CREATE INDEX "Review_moderationStatus_idx" ON "Review"("moderationStatus");
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "Listing_type_status_idx" ON "Listing"("type", "status");

ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_travellerId_fkey" FOREIGN KEY ("travellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
