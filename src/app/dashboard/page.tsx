import type { Metadata } from "next";
import { TravellerDashboard } from "@/features/traveller-dashboard/traveller-dashboard";
import { getTravellerDashboard } from "@/services/traveller-dashboard";

export const metadata: Metadata = { title: "Your travel space | SafariConnect" };

export default async function DashboardPage() {
  const data = await getTravellerDashboard();
  return <TravellerDashboard data={data} />;
}
