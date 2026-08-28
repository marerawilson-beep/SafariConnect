-- CreateEnum
CREATE TYPE "Role" AS ENUM ('traveller', 'vendor', 'administrator', 'super_administrator');
-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('accommodation', 'tour', 'activity', 'restaurant');

CREATE TABLE "User" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'traveller', "emailVerified" TIMESTAMP(3), "image" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Account" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, CONSTRAINT "Account_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Session" ("id" TEXT NOT NULL, "sessionToken" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL, CONSTRAINT "Session_pkey" PRIMARY KEY ("id"));
CREATE TABLE "VerificationToken" ("identifier" TEXT NOT NULL, "token" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL);
CREATE TABLE "Listing" ("id" TEXT NOT NULL, "ownerId" TEXT NOT NULL, "type" "ListingType" NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL, "location" TEXT NOT NULL, "priceFrom" DECIMAL(12,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'KES', "isPublished" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Listing_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ListingImage" ("id" TEXT NOT NULL, "listingId" TEXT NOT NULL, "url" TEXT NOT NULL, "alt" TEXT, "position" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Accommodation" ("id" TEXT NOT NULL, "listingId" TEXT NOT NULL, "rooms" INTEGER, "guests" INTEGER, CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Tour" ("id" TEXT NOT NULL, "listingId" TEXT NOT NULL, "durationDays" INTEGER NOT NULL, "maxGuests" INTEGER, CONSTRAINT "Tour_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Activity" ("id" TEXT NOT NULL, "listingId" TEXT NOT NULL, "durationMinutes" INTEGER NOT NULL, "minAge" INTEGER, CONSTRAINT "Activity_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Restaurant" ("id" TEXT NOT NULL, "listingId" TEXT NOT NULL, "cuisine" TEXT, "address" TEXT, CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
CREATE INDEX "Listing_type_isPublished_idx" ON "Listing"("type", "isPublished");
CREATE INDEX "Listing_location_isPublished_idx" ON "Listing"("location", "isPublished");
CREATE UNIQUE INDEX "ListingImage_listingId_position_key" ON "ListingImage"("listingId", "position");
CREATE UNIQUE INDEX "Accommodation_listingId_key" ON "Accommodation"("listingId");
CREATE UNIQUE INDEX "Tour_listingId_key" ON "Tour"("listingId");
CREATE UNIQUE INDEX "Activity_listingId_key" ON "Activity"("listingId");
CREATE UNIQUE INDEX "Restaurant_listingId_key" ON "Restaurant"("listingId");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Accommodation" ADD CONSTRAINT "Accommodation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
