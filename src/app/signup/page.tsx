"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const mapSignupError = (error: AuthError | null): string => {
    if (!error) return "An unexpected error occurred.";
    const message = (error.message || "").toLowerCase();
    const code = error.code || "";

    if (
      message.includes("rate limit") ||
      code === "over_email_send_rate_limit" ||
      code === "over_request_rate_limit"
    ) {
      return "Too many signup emails were requested. Please wait a few minutes before trying again, or use a different email for testing.";
    }

    if (
      message.includes("already registered") ||
      message.includes("already exists") ||
      code === "user_already_exists"
    ) {
      return "This email address is already registered. Please try logging in instead.";
    }

    if (
      message.includes("weak password") ||
      message.includes("at least 6 characters") ||
      code === "weak_password"
    ) {
      return "Your password is too weak. Please use a stronger password (at least 6 characters).";
    }

    if (message.includes("60 seconds") || message.includes("once every")) {
      return "For security purposes, please wait at least 60 seconds between verification requests.";
    }

    if (message.includes("invalid email") || code === "email_address_invalid") {
      return "Please enter a valid email address.";
    }

    return error.message || "An unexpected error occurred.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isLoading) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    setErrorMsg(null);
    setIsSuccess(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      setIsLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setIsLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    console.log("[SignupFlow] Processing signup request for email:", email.trim());

    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            display_name: displayName.trim() || email.split("@")[0],
          },
        },
      });

      if (error) {
        setErrorMsg(mapSignupError(error));
      } else {
        // Check if confirmation is required
        if (data.session) {
          // Automatic login if email confirmation is disabled
          router.push("/");
          router.refresh();
        } else {
          setIsSuccess(true);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(mapSignupError(err as AuthError));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/60 p-8 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Start tracking your internship journey
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6 text-emerald-400">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <div>
              <h3 className="font-semibold text-lg text-white">Sign up successful!</h3>
              <p className="text-sm mt-1 text-zinc-400">
                Please check your email inbox to confirm your account, then return here to login.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-zinc-300">
                  Full Name / Display Name
                </label>
                <input
                  id="display-name"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-zinc-300">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Password (min. 6 characters)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-white placeholder-zinc-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>
        )}

        {!isSuccess && (
          <div className="text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
