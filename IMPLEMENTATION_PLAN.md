# SafariConnect implementation plan

## Foundation

This repository begins as a Next.js + TypeScript + Tailwind application. The next implementation milestone adds Prisma/PostgreSQL, Auth.js, shared validation, service adapters, and a full environment-variable contract. Secrets will remain outside the repository.

## Product architecture

The application will be split into `app` routes, reusable `components`, domain-oriented `features`, server `actions`, API route handlers, `services` for integrations, `lib` infrastructure, and `prisma` data models. UI components will not contain authorization or database logic.

## Marketplace and discovery

The public product begins with the homepage, destinations, category indexes, server-rendered results, and premium listing pages. PostgreSQL full-text search and query-backed filters will power destination, category, amenities, price, rating, and verification searches. Listing types will share a core model with accommodation, tour, activity, and restaurant extensions.

## Accounts and workflows

Auth.js will supply traveller, vendor, administrator, and super-administrator roles. Server-side guards will protect each dashboard. Booking is intentionally a request-to-book workflow: no payment gateway, payment capture, payout, or payment webhook will be added. A strict state machine governs booking-request transitions and accepted requests create trips.

## Vendor, administration, and AI

Vendor onboarding and listing creation will be multi-step, draftable flows. Administrators will review vendors, listings, reports, and reviews; every sensitive action is persisted to an audit log. Map, image, email, and AI services will be interfaces with development adapters. Safari AI will retrieve only authorized listing data and will not invent listings, prices, or availability.

## Delivery order

1. Public design system and responsive marketplace shell (current milestone).
2. Prisma schema, seed data, authentication, search, and listing records.
3. Booking requests, traveller dashboard, messaging, and wishlist.
4. Vendor onboarding/dashboard and administration.
5. AI planner, SEO, tests, accessibility, performance, and deployment hardening.
