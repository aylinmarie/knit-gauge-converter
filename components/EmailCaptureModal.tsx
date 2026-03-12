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
  const firstFocusRef = useRef<HTMLInputElement>(null);

  // Reset form state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setSubmitted(false);
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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up real email capture API before launch
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
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                ref={firstFocusRef}
                type="email"
                required
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                autoComplete="email"
              />
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
