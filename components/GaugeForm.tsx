"use client";

import { useState, useEffect, FormEvent } from "react";
import styles from "./GaugeForm.module.css";

const YARN_WEIGHTS = [
  { value: "lace", label: "Lace (0)" },
  { value: "super-fine", label: "Super Fine / Fingering (1)" },
  { value: "fine", label: "Fine / Sport (2)" },
  { value: "light", label: "Light / DK (3)" },
  { value: "medium", label: "Medium / Worsted (4)" },
  { value: "bulky", label: "Bulky (5)" },
  { value: "super-bulky", label: "Super Bulky (6)" },
  { value: "jumbo", label: "Jumbo (7)" },
];

// 4 inches = 10.16 cm; convert sts/10cm → sts/4in
const metricToImperial = (v: number) => v * (10.16 / 10);
// sts/4in → sts/10cm (for display when unit=metric)
const imperialToMetric = (v: number) => v * (10 / 10.16);

interface Prefill {
  patternGauge?: number;     // sts/4in
  patternRowGauge?: number;  // sts/4in
  patternYarnWeight?: string;
}

interface GaugeFormProps {
  onSubmit: (data: {
    patternYarnWeight: string;
    patternGauge: number;
    patternRowGauge?: number;
    userYarnWeight: string;
  }) => void;
  loading: boolean;
  unit: "imperial" | "metric";
  prefill?: Prefill;
}

export default function GaugeForm({ onSubmit, loading, unit, prefill }: GaugeFormProps) {
  const [patternYarnWeight, setPatternYarnWeight] = useState("medium");
  const [patternGauge, setPatternGauge] = useState<string>("18");
  const [patternRowGauge, setPatternRowGauge] = useState<string>("");
  const [userYarnWeight, setUserYarnWeight] = useState("light");

  // Sync pre-filled values from Ravelry import
  useEffect(() => {
    if (!prefill) return;
    if (prefill.patternYarnWeight) setPatternYarnWeight(prefill.patternYarnWeight);
    if (prefill.patternGauge !== undefined) {
      const displayed = unit === "metric"
        ? Math.round(imperialToMetric(prefill.patternGauge) * 2) / 2
        : prefill.patternGauge;
      setPatternGauge(String(displayed));
    }
    if (prefill.patternRowGauge !== undefined) {
      const displayed = unit === "metric"
        ? Math.round(imperialToMetric(prefill.patternRowGauge) * 2) / 2
        : prefill.patternRowGauge;
      setPatternRowGauge(String(displayed));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // `unit` is intentionally excluded: we only want to sync when a new prefill
  // arrives from Ravelry, not re-run whenever the user toggles imperial/metric.
  }, [prefill]);

  const gaugeUnit = unit === "metric" ? "sts per 10 cm" : "sts per 4 inches";
  const rowGaugeUnit = unit === "metric" ? "rows per 10 cm" : "rows per 4 inches";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const gaugeNum = parseFloat(patternGauge);
    if (isNaN(gaugeNum) || gaugeNum <= 0) return;

    // Convert metric inputs to imperial for the API (which always works in sts/4in)
    const gaugeImperial = unit === "metric" ? metricToImperial(gaugeNum) : gaugeNum;

    let rowGaugeImperial: number | undefined;
    if (patternRowGauge !== "") {
      const rowNum = parseFloat(patternRowGauge);
      if (!isNaN(rowNum) && rowNum > 0) {
        rowGaugeImperial = unit === "metric" ? metricToImperial(rowNum) : rowNum;
      }
    }

    onSubmit({
      patternYarnWeight,
      patternGauge: gaugeImperial,
      patternRowGauge: rowGaugeImperial,
      userYarnWeight,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="patternYarnWeight" className={styles.label}>
          Pattern Yarn Weight
          <span className={styles.labelHint}>
            The yarn weight specified in the original pattern
          </span>
        </label>
        <div className={styles.selectWrapper}>
          <select
            id="patternYarnWeight"
            className={styles.select}
            value={patternYarnWeight}
            onChange={(e) => setPatternYarnWeight(e.target.value)}
            disabled={loading}
            required
          >
            {YARN_WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.gaugeRow}>
        <div className={styles.fieldGroup}>
          <label htmlFor="patternGauge" className={styles.label}>
            Stitch Gauge
            <span className={styles.labelHint}>
              {gaugeUnit}
            </span>
          </label>
          <input
            id="patternGauge"
            type="number"
            className={styles.input}
            value={patternGauge}
            onChange={(e) => setPatternGauge(e.target.value)}
            min="1"
            max={unit === "metric" ? "98" : "100"}
            step="0.5"
            placeholder={unit === "metric" ? "e.g. 18" : "e.g. 18"}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="patternRowGauge" className={styles.label}>
            Row Gauge
            <span className={styles.labelHint}>
              {rowGaugeUnit} <span className={styles.optionalInline}>optional</span>
            </span>
          </label>
          <input
            id="patternRowGauge"
            type="number"
            className={styles.input}
            value={patternRowGauge}
            onChange={(e) => setPatternRowGauge(e.target.value)}
            min="1"
            max={unit === "metric" ? "196" : "200"}
            step="0.5"
            placeholder={unit === "metric" ? "e.g. 24" : "e.g. 24"}
            disabled={loading}
          />
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldGroup}>
        <label htmlFor="userYarnWeight" className={styles.label}>
          Your Yarn Weight
          <span className={styles.labelHint}>
            The yarn weight you plan to substitute
          </span>
        </label>
        <div className={styles.selectWrapper}>
          <select
            id="userYarnWeight"
            className={styles.select}
            value={userYarnWeight}
            onChange={(e) => setUserYarnWeight(e.target.value)}
            disabled={loading}
            required
          >
            {YARN_WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? (
          <span className={styles.loadingDots}>
            <span />
            <span />
            <span />
          </span>
        ) : (
          "Estimate Gauge"
        )}
      </button>
    </form>
  );
}
