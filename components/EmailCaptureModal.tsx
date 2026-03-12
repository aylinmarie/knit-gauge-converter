"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./EmailCaptureModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailCaptureModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const firstFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !submitted) {
      firstFocusRef.current?.focus();
    }
  }, [isOpen, submitted]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
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
              Want pattern import?
            </h2>
            <p className={styles.body}>
              Enter your email to get notified when direct pattern import
              launches — no spam, just feature updates.
            </p>
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <input
                ref={firstFocusRef}
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                aria-label="Email address"
                autoComplete="email"
              />
              {error && (
                <p className={styles.error} role="alert">{error}</p>
              )}
              <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn}>
                  Notify me
                </button>
                <button
                  type="button"
                  className={styles.skipBtn}
                  onClick={onClose}
                >
                  No thanks
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
