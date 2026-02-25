"use client";

import { useState } from "react";
import styles from "./page.module.css";
import GaugeForm from "@/components/GaugeForm";
import ResultsPanel from "@/components/ResultsPanel";
import StitchConverter from "@/components/StitchConverter";
import RavelryImport from "@/components/RavelryImport";

export interface EstimateResult {
  estimatedGauge: number;
  estimatedRowGauge?: number;
  reasoning: string;
  reasoningMetric: string;
  patternYarnWeight: string;
  patternGauge: number;
  patternRowGauge?: number;
  userYarnWeight: string;
}

export default function Home() {
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [prefill, setPrefill] = useState<
    | {
        patternGauge?: number;
        patternRowGauge?: number;
        patternYarnWeight?: string;
      }
    | undefined
  >(undefined);

  const handleSubmit = async (data: {
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
        patternYarnWeight: data.patternYarnWeight,
        patternGauge: data.patternGauge,
        patternRowGauge: data.patternRowGauge,
        userYarnWeight: data.userYarnWeight,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

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
          aria-label="Toggle between imperial and metric units"
        >
          <span
            className={
              unit === "imperial" ? styles.unitActive : styles.unitInactive
            }
          >
            in
          </span>
          <span className={styles.unitSep}>/</span>
          <span
            className={
              unit === "metric" ? styles.unitActive : styles.unitInactive
            }
          >
            cm
          </span>
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.leftColumn}>
          <div className={styles.toolSection}>
            <RavelryImport
              onImport={({
                patternGauge,
                patternRowGauge,
                patternYarnWeight,
              }) =>
                setPrefill({ patternGauge, patternRowGauge, patternYarnWeight })
              }
              disabled={loading}
            />
          </div>
          <div className={styles.toolDivider} />
          <div className={styles.toolSection}>
            <p className={styles.toolLabel}>Gauge Estimator</p>
            <GaugeForm
              onSubmit={handleSubmit}
              loading={loading}
              unit={unit}
              prefill={prefill}
            />
          </div>
          <div className={styles.toolDivider} />
          <div className={styles.toolSection}>
            <p className={styles.toolLabel}>Stitch Count Converter</p>
            <StitchConverter result={result} />
          </div>
        </section>

        <section className={styles.rightColumn}>
          <p className={styles.columnLabel}>Results</p>
          <ResultsPanel
            result={result}
            loading={loading}
            error={error}
            unit={unit}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        Knitting Gauge Estimator — powered by Claude AI + Supabase · created by{" "}
        <a
          href="https://www.aylinmarie.co/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aylin Marie
        </a>
      </footer>
    </div>
  );
}
