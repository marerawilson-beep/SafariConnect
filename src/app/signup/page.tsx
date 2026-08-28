import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Create an account | SafariConnect" };
export default function SignUpPage() { return <AuthForm mode="signup" />; }
