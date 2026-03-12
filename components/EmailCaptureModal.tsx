"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./EmailCaptureModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailCaptureModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const firstFocusRef = useRef<HTMLInputElement>(null);

  // Reset form state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setSubmitting(false);
      setSubmitted(false);
      setError("");
    }
  }, [isOpen]);

  // Focus the email input when the modal opens
  useEffect(() => {
    if (isOpen) {
      firstFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? "Something went wrong. Please try again."
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-capture-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Dismiss email sign-up prompt"
        >
          &times;
        </button>

        {submitted ? (
          <div className={styles.thanks}>
            <p className={styles.thanksTitle}>You&apos;re on the list!</p>
            <p className={styles.thanksBody}>
              We&apos;ll let you know when pattern import and other new features launch.
            </p>
            <button className={styles.doneBtn} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 id="email-capture-title" className={styles.title}>
              Full pattern conversion is coming!
            </h2>
            <p className={styles.body}>
              Soon you&apos;ll be able to paste in any pattern and get a
              brand-new PDF rewritten for your yarn — stitch counts, row
              counts, and all. Drop your email and we&apos;ll tell you when
              it&apos;s ready.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                ref={firstFocusRef}
                type="email"
                required
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                aria-label="Email address"
                autoComplete="email"
                disabled={submitting}
              />
              {error && (
                <p className={styles.error} role="alert">{error}</p>
              )}
              <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? "Saving…" : "Notify me"}
                </button>
                <button
                  type="button"
                  className={styles.skipBtn}
                  onClick={onClose}
                  disabled={submitting}
                >
                  No thanks
                </button>
              </div>
              <p className={styles.consent}>
                By submitting you agree to our{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                . No spam, unsubscribe any time.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
