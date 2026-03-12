"use client";

import { useState, useCallback } from "react";
import type { YarnWeightKey } from "@/lib/yarnWeights";
import styles from "./page.module.css";
import GaugeForm from "@/components/GaugeForm";
import ResultsPanel from "@/components/ResultsPanel";
import StitchConverter from "@/components/StitchConverter";
import RavelryImport from "@/components/RavelryImport";
import EmailCaptureModal from "@/components/EmailCaptureModal";

export interface EstimateResult {
  estimatedGauge: number;
  estimatedRowGauge?: number;
  reasoning: string;
  reasoningMetric: string;
  patternYarnWeight: YarnWeightKey;
  patternGauge: number;
  patternRowGauge?: number;
  userYarnWeight: YarnWeightKey;
}

export default function Home() {
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [prefill, setPrefill] = useState<
    | {
        patternGauge?: number;
        patternRowGauge?: number;
        patternYarnWeight?: string;
      }
    | undefined
  >(undefined);

  const handleSubmit = useCallback(async (data: {
    patternYarnWeight: string;
    patternGauge: number;
    patternRowGauge?: number;
    userYarnWeight: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Server error: ${response.status}`);
      }

      const json = await response.json();
      setResult({
        estimatedGauge: json.estimatedGauge,
        estimatedRowGauge: json.estimatedRowGauge,
        reasoning: json.reasoning,
        reasoningMetric: json.reasoningMetric,
        patternYarnWeight: data.patternYarnWeight as YarnWeightKey,
        patternGauge: data.patternGauge,
        patternRowGauge: data.patternRowGauge,
        userYarnWeight: data.userYarnWeight as YarnWeightKey,
      });

      // On mobile, scroll results into view automatically
      if (typeof window !== "undefined" && window.innerWidth <= 768) {
        setTimeout(() => {
          document.getElementById("results-panel")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImport = useCallback(({ patternGauge, patternRowGauge, patternYarnWeight }: {
    patternGauge: number;
    patternRowGauge?: number;
    patternYarnWeight?: string;
    patternName: string;
  }) => {
    setPrefill({ patternGauge, patternRowGauge, patternYarnWeight });
  }, []);

  const isMetric = unit === "metric";

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Knitting Gauge Estimator</h1>
          <span className={styles.headerSubtitle}>
            Gauge estimator, pattern stitch conversion + needle recommendations
            for yarn substitution
          </span>
        </div>
        <button
          className={styles.unitToggle}
          onClick={() =>
            setUnit((u) => (u === "imperial" ? "metric" : "imperial"))
          }
          aria-label={isMetric ? "Switch to imperial units (inches)" : "Switch to metric units (cm)"}
          aria-pressed={isMetric}
        >
          <span className={styles.unitToggleLabel}>Units:</span>
          <span
            className={
              unit === "imperial" ? styles.unitActive : styles.unitInactive
            }
          >
            in
          </span>
          <span className={styles.unitSep} aria-hidden="true">/</span>
          <span
            className={
              unit === "metric" ? styles.unitActive : styles.unitInactive
            }
          >
            cm
          </span>
          <span className={styles.unitSwapIcon} aria-hidden="true">↕</span>
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.leftColumn} aria-label="Tools">
          <div className={styles.toolSection}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge} aria-hidden="true">1</span>
              <h2 className={styles.toolLabel}>Import from Ravelry</h2>
              <span className={styles.stepOptional}>optional</span>
            </div>
            <RavelryImport
              onImport={handleImport}
              disabled={loading}
            />
          </div>
          <div className={styles.toolDivider} />
          <div className={styles.toolSection}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge} aria-hidden="true">2</span>
              <h2 className={styles.toolLabel}>Gauge Estimator</h2>
            </div>
            <GaugeForm
              onSubmit={handleSubmit}
              loading={loading}
              unit={unit}
              prefill={prefill}
            />
          </div>
          <div className={styles.toolDivider} />
          <div className={styles.toolSection}>
            <div className={styles.stepHeader}>
              <span className={styles.stepBadge} aria-hidden="true">3</span>
              <h2 className={styles.toolLabel}>Stitch Count Converter</h2>
              {!result && <span className={styles.stepOptional}>after estimating</span>}
            </div>
            <StitchConverter result={result} />
          </div>
        </section>

        <section
          className={styles.rightColumn}
          id="results-panel"
          aria-labelledby="results-heading"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className={styles.columnLabel} id="results-heading">Results</h2>
          <ResultsPanel
            result={result}
            loading={loading}
            error={error}
            unit={unit}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        Knitting Gauge Estimator — powered by Claude AI
        {" "}·{" "}
        <button
          className={styles.footerLink}
          onClick={() => setShowEmailCapture(true)}
        >
          Sign up for updates
        </button>
        {" "}·{" "}
        <a href="/privacy">Privacy Policy</a>
      </footer>

      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
      />
    </div>
  );
}
