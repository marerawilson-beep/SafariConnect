import type { Metadata } from "next";
import { OperationsDashboard } from "@/features/operations/operations-dashboard";
import { getVendorDashboard } from "@/services/vendor-dashboard";

export const metadata: Metadata = { title: "Vendor dashboard | SafariConnect" };
export default async function VendorPage() { const data = await getVendorDashboard(); return <OperationsDashboard eyebrow="YOUR HOST SPACE" title={data.profile?.businessName ?? "Build your host presence."} sections={[{ title: "Your listings", cards: data.listings.map((item) => ({ id: item.id, title: item.title, detail: item.location, status: item.status })) }, { title: "Booking requests", cards: data.bookingRequests.map((item) => ({ id: item.id, title: item.listing.title, detail: item.traveller.name ?? item.traveller.email, status: item.status })) }, { title: "Messages", cards: data.messages.map((item) => ({ id: item.id, title: item.listing?.title ?? "Conversation", detail: item.sender.name ?? item.sender.email })) }]}/>; }
