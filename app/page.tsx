"use client";

import { useState } from "react";
import styles from "./page.module.css";
import GaugeForm from "@/components/GaugeForm";
import ResultsPanel from "@/components/ResultsPanel";

export interface EstimateResult {
  estimatedGauge: number;
  estimatedRowGauge?: number;
  reasoning: string;
  patternYarnWeight: string;
  patternGauge: number;
  patternRowGauge?: number;
  userYarnWeight: string;
  needleSuggestion?: string;
}

export default function Home() {
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");

  const handleSubmit = async (data: {
    patternYarnWeight: string;
    patternGauge: number;
    patternRowGauge?: number;
    userYarnWeight: string;
    fiberType?: string;
    tension?: string;
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
        patternYarnWeight: data.patternYarnWeight,
        patternGauge: data.patternGauge,
        patternRowGauge: data.patternRowGauge,
        userYarnWeight: data.userYarnWeight,
        needleSuggestion: json.needleSuggestion,
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
            Gauge conversion + AI needle recommendations for yarn substitution
          </span>
        </div>
        <button
          className={styles.unitToggle}
          onClick={() => setUnit((u) => (u === "imperial" ? "metric" : "imperial"))}
          aria-label="Toggle between imperial and metric units"
        >
          <span className={unit === "imperial" ? styles.unitActive : styles.unitInactive}>in</span>
          <span className={styles.unitSep}>/</span>
          <span className={unit === "metric" ? styles.unitActive : styles.unitInactive}>cm</span>
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.leftColumn}>
          <p className={styles.columnLabel}>Inputs</p>
          <GaugeForm onSubmit={handleSubmit} loading={loading} unit={unit} />
        </section>

        <section className={styles.rightColumn}>
          <p className={styles.columnLabel}>Results</p>
          <ResultsPanel result={result} loading={loading} error={error} unit={unit} />
        </section>
      </main>

      <footer className={styles.footer}>
        Knitting Gauge Estimator — powered by Supabase + Anthropic · created by{" "}
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
