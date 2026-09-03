import { requireVendor } from "@/lib/authorization";
import { OnboardingForm } from "@/features/vendor/onboarding-form";

export default async function VendorOnboardingPage() { await requireVendor(); return <OnboardingForm />; }
