import type { Metadata } from "next";
import { OperationsDashboard } from "@/features/operations/operations-dashboard";
import { getAdminDashboard } from "@/services/admin-dashboard";

export const metadata: Metadata = { title: "Administration | SafariConnect" };
export default async function AdminPage() { const data = await getAdminDashboard(); return <OperationsDashboard eyebrow="ADMINISTRATION" title="Marketplace review." sections={[{ title: "Vendor verification", cards: data.vendors.map((item) => ({ id: item.id, title: item.businessName ?? item.user.name ?? item.user.email, detail: item.contactEmail ?? item.user.email, status: item.verificationStatus })) }, { title: "Submitted listings", cards: data.listings.map((item) => ({ id: item.id, title: item.title, detail: item.owner.name ?? item.owner.email, status: item.status })) }, { title: "Open reports", cards: data.reports.map((item) => ({ id: item.id, title: item.listing?.title ?? "Review report", detail: item.reason, status: item.status })) }, { title: "Review moderation", cards: data.reviews.map((item) => ({ id: item.id, title: item.listing.title, detail: item.content, status: item.moderationStatus })) }]}/>; }
