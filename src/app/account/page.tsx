"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading & status states
  const [profileLoading, setProfileLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [wipeSuccess, setWipeSuccess] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [wipeError, setWipeError] = useState<string | null>(null);

  // Wipe confirmation state
  const [confirmWipeText, setConfirmWipeText] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setDisplayName(user.user_metadata?.display_name || "");
        setEmail(user.email || "");
      }
      setIsInitializing(false);
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });

      if (error) {
        setProfileError(error.message);
      } else {
        setProfileSuccess("Display name updated successfully.");
        // Refresh session
        await supabase.auth.getUser();
      }
    } catch {
      setProfileError("An unexpected error occurred.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: email.trim(),
      });

      if (error) {
        setEmailError(error.message);
      } else {
        setEmailSuccess("A confirmation link has been sent to your new email address. Please check your inbox.");
      }
    } catch {
      setEmailError("An unexpected error occurred.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      setPasswordLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess("Password updated successfully.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleWipeData = async () => {
    if (confirmWipeText !== "DELETE MY DATA") {
      setWipeError("Please type 'DELETE MY DATA' exactly to confirm.");
      return;
    }

    setWipeLoading(true);
    setWipeSuccess(null);
    setWipeError(null);

    try {
      const res = await fetch("/api/account/wipe", {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setWipeError(result.error?.message || "Failed to wipe data.");
      } else {
        setWipeSuccess("All work logs and user data have been successfully deleted.");
        setConfirmWipeText("");
        router.refresh();
      }
    } catch {
      setWipeError("An unexpected error occurred while communicating with the server.");
    } finally {
      setWipeLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isInitializing) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Account Settings
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your personal profile, email settings, and database storage.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings Card */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-5">
            <User className="h-5 w-5 text-indigo-500" />
            Profile Details
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={profileLoading}
                className="mt-1.5 block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Your name"
              />
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {profileLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Update Profile Name"
              )}
            </button>
          </form>
        </div>

        {/* Change Email Card */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-5">
            <Mail className="h-5 w-5 text-indigo-500" />
            Email Settings
          </h2>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailLoading}
                className="mt-1.5 block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {emailSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={emailLoading}
              className="flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {emailLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Email Address"
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-5">
            <Lock className="h-5 w-5 text-indigo-500" />
            Update Password
          </h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={passwordLoading}
                className="mt-1.5 block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                className="mt-1.5 block w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {passwordLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>

        {/* Dangerous Wipe Action Card */}
        <div className="bg-rose-50/20 dark:bg-rose-950/5 p-6 rounded-xl border border-rose-200 dark:border-rose-900/30 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-rose-700 dark:text-rose-400 mb-2.5">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              This action is permanent and cannot be undone. Wiping your data will completely delete all of your:
              <span className="block mt-1 font-semibold text-zinc-700 dark:text-zinc-300">
                • Work Logs & links<br/>
                • Custom Tags<br/>
                • Weekly Reflection Reviews<br/>
                • Generated/Saved CV Bullets
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Type <span className="font-mono bg-rose-100 dark:bg-rose-950/40 px-1 py-0.5 rounded select-all font-bold">DELETE MY DATA</span> to confirm
              </label>
              <input
                type="text"
                value={confirmWipeText}
                onChange={(e) => setConfirmWipeText(e.target.value)}
                disabled={wipeLoading}
                className="mt-1.5 block w-full rounded-lg border border-rose-200 dark:border-rose-900/30 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-semibold"
                placeholder="DELETE MY DATA"
              />
            </div>

            {wipeSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{wipeSuccess}</span>
              </div>
            )}

            {wipeError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{wipeError}</span>
              </div>
            )}

            <button
              onClick={handleWipeData}
              disabled={confirmWipeText !== "DELETE MY DATA" || wipeLoading}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {wipeLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wiping data...
                </span>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Wipe All My Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
