"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const values = isSignup ? { name, email, password } : { email, password };
    const validation = (isSignup ? signUpSchema : signInSchema).safeParse(values);
    if (!validation.success) { setError(validation.error.issues[0]?.message ?? "Please check your details."); return; }
    setPending(true);
    try {
      if (isSignup) {
        const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data) });
        const payload = await response.json() as { error?: string };
        if (!response.ok) { setError(payload.error ?? "We could not create your account."); return; }
      }
      const result = await signIn("credentials", { email: validation.data.email, password: validation.data.password, redirect: false });
      if (result?.error) { setError("Incorrect email or password."); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setError("Something went wrong. Please try again."); }
    finally { setPending(false); }
  }

  return <main className="auth-page"><section className="auth-panel"><Link href="/" className="brand auth-brand"><span>SC</span>SafariConnect</Link><p className="eyebrow">{isSignup ? "BEGIN YOUR JOURNEY" : "WELCOME BACK"}</p><h1>{isSignup ? "Travel closer to Kenya." : "Good to see you."}</h1><p className="auth-intro">{isSignup ? "Create your traveller account to save the places that move you." : "Sign in to continue planning your next considered journey."}</p><form className="auth-form" onSubmit={submit} noValidate>{isSignup && <label><span>Full name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>}<label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? "new-password" : "current-password"} required /></label>{isSignup && <p className="auth-hint">Use at least 12 characters.</p>}{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-dark auth-submit" disabled={pending}>{pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}</button></form><p className="auth-switch">{isSignup ? "Already have an account?" : "New to SafariConnect?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Create an account"}</Link></p></section></main>;
}
