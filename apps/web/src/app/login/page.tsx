"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, profile, loading } = useAuth();
  const [nextPath, setNextPath] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) setNextPath(next);

    return () => {
      recaptchaRef.current?.clear();
    };
  }, []);

  useEffect(() => {
    if (!user || loading || !nextPath) return;
    window.location.href = nextPath;
  }, [loading, nextPath, user]);

  async function loginWithGoogle() {
    setMessage("");
    const [{ GoogleAuthProvider, signInWithPopup }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
    await signInWithPopup(auth, new GoogleAuthProvider());
    setMessage("Logged in successfully.");
  }

  async function sendOtp(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!recaptchaRef.current) {
      const [{ RecaptchaVerifier }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible"
      });
    }

    const [{ signInWithPhoneNumber }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
    const result = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
    setConfirmation(result);
    setMessage("OTP sent. Check your phone.");
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    if (!confirmation) return;
    await confirmation.confirm(otp);
    setMessage("Phone login successful.");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a href="/" className="auth-brand">ApnaRooms.com</a>
        <h1>Login to continue</h1>
        <p>Use Google or phone OTP. First synced account becomes the admin bootstrap user.</p>

        {loading ? <p>Checking session...</p> : null}

        {user ? (
          <div className="auth-success">
            <strong>{profile?.name ?? user.phoneNumber ?? user.email ?? "Logged in user"}</strong>
            <span>Role: {profile?.role ?? "syncing"}</span>
            <div className="auth-actions">
              <a href={nextPath || (profile && ["ADMIN", "SALES", "SUPPORT"].includes(profile.role) ? "/admin" : "/dashboard")}>Continue</a>
              <button
                type="button"
                onClick={async () => {
                  const [{ signOut }, auth] = await Promise.all([import("firebase/auth"), getFirebaseAuth()]);
                  await signOut(auth);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <button className="google-button" type="button" onClick={loginWithGoogle}>
              Continue with Google
            </button>

            <div className="auth-divider">or phone OTP</div>

            <form onSubmit={sendOtp} className="auth-form">
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91XXXXXXXXXX" />
              <button type="submit">Send OTP</button>
            </form>

            {confirmation ? (
              <form onSubmit={verifyOtp} className="auth-form">
                <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter OTP" />
                <button type="submit">Verify OTP</button>
              </form>
            ) : null}
          </>
        )}

        <div id="recaptcha-container" />
        {message ? <p className="auth-message">{message}</p> : null}
      </section>
    </main>
  );
}
