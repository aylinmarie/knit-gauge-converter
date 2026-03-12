import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Knitting Gauge Estimator",
};

const LAST_UPDATED = "March 12, 2026";

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <a href="/" className={styles.backLink}>← Back to app</a>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>
        </header>

        <section className={styles.section}>
          <p className={styles.lead}>
            This policy explains what personal data the Knitting Gauge Estimator
            collects, why, and what rights you have over it. The controller of
            your data is <strong>[Your Name]</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Data we collect</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Why we collect it</th>
                <th>Legal basis (GDPR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Email address</strong></td>
                <td>
                  To notify you when the full pattern conversion feature launches.
                  You provide this voluntarily through the sign-up form.
                </td>
                <td>Consent (Art. 6(1)(a))</td>
              </tr>
              <tr>
                <td><strong>Anonymised usage data</strong></td>
                <td>
                  Aggregate page-view counts via Vercel Analytics. No cookies are
                  used; Vercel derives a daily-rotating anonymous hash from your
                  IP address and user-agent string. The raw IP is never stored.
                </td>
                <td>Legitimate interests (Art. 6(1)(f))</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.body}>
            We do <strong>not</strong> collect names, payment information, or any
            other personal data. All gauge calculations happen entirely in your
            browser session and are not stored.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. How your email is stored</h2>
          <p className={styles.body}>
            Email addresses are stored in a database managed by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase
            </a>{" "}
            (a US-based infrastructure provider). Supabase is our data processor
            and only handles data on our behalf. We rely on Supabase&apos;s{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{" "}
            and standard contractual clauses for transfers outside the EEA.
          </p>
          <p className={styles.body}>
            We retain your email until you withdraw consent (see Section 4).
            We will not sell, rent, or share your email with any third party for
            their own marketing purposes.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. Analytics</h2>
          <p className={styles.body}>
            This site uses{" "}
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel Analytics
            </a>
            , a privacy-first analytics tool. It does not use cookies or
            persistent identifiers. It counts unique daily visitors using a
            short-lived hash that cannot be used to track you across days or
            across other websites. No banner is required for this type of
            analytics under ePrivacy and GDPR guidance.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. Your rights</h2>
          <p className={styles.body}>
            Depending on where you live, you may have the following rights:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Access</strong> — request a copy of the data we hold
              about you.
            </li>
            <li>
              <strong>Correction</strong> — ask us to correct inaccurate data.
            </li>
            <li>
              <strong>Erasure</strong> — ask us to delete your email address at
              any time.
            </li>
            <li>
              <strong>Withdraw consent</strong> — you can opt out of feature
              update emails at any time; just email us (see Section 5).
            </li>
            <li>
              <strong>Portability</strong> — request your data in a
              machine-readable format.
            </li>
            <li>
              <strong>Complaint</strong> — if you are in the EU/UK, you have the
              right to lodge a complaint with your local data protection
              authority.
            </li>
          </ul>
          <p className={styles.body}>
            US residents (including California): we do not sell personal
            information. You may request deletion of your email at any time by
            contacting us.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. Contact</h2>
          <p className={styles.body}>
            For any privacy-related questions or requests, email us at{" "}
            <a href="mailto:[privacy@yourdomain.com]">
              [privacy@yourdomain.com]
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. Changes to this policy</h2>
          <p className={styles.body}>
            If we make material changes, we will update the &ldquo;Last
            updated&rdquo; date at the top of this page. Continued use of the
            email sign-up after a change constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
