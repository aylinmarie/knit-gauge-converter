"use client";

import { useState, FormEvent } from "react";
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

const FIBER_TYPES = [
  { value: "wool", label: "Wool" },
  { value: "superwash-wool", label: "Superwash Wool" },
  { value: "cotton", label: "Cotton" },
  { value: "acrylic", label: "Acrylic" },
  { value: "alpaca", label: "Alpaca" },
  { value: "linen", label: "Linen" },
  { value: "bamboo", label: "Bamboo" },
  { value: "mohair-blend", label: "Mohair Blend" },
  { value: "silk-blend", label: "Silk Blend" },
];

// 4 inches = 10.16 cm; convert sts/10cm → sts/4in
const metricToImperial = (v: number) => v * (10.16 / 10);

interface GaugeFormProps {
  onSubmit: (data: {
    patternYarnWeight: string;
    patternGauge: number;
    patternRowGauge?: number;
    patternStitchCount?: number;
    userYarnWeight: string;
    fiberType?: string;
    tension?: string;
  }) => void;
  loading: boolean;
  unit: "imperial" | "metric";
}

export default function GaugeForm({ onSubmit, loading, unit }: GaugeFormProps) {
  const [patternYarnWeight, setPatternYarnWeight] = useState("medium");
  const [patternGauge, setPatternGauge] = useState<string>("18");
  const [patternRowGauge, setPatternRowGauge] = useState<string>("");
  const [patternStitchCount, setPatternStitchCount] = useState<string>("");
  const [userYarnWeight, setUserYarnWeight] = useState("light");
  const [fiberType, setFiberType] = useState("");
  const [tension, setTension] = useState("");

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

    let stitchCount: number | undefined;
    if (patternStitchCount !== "") {
      const sc = parseInt(patternStitchCount, 10);
      if (!isNaN(sc) && sc > 0) stitchCount = sc;
    }

    onSubmit({
      patternYarnWeight,
      patternGauge: gaugeImperial,
      patternRowGauge: rowGaugeImperial,
      patternStitchCount: stitchCount,
      userYarnWeight,
      fiberType: fiberType || undefined,
      tension: tension || undefined,
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

      <div className={styles.fieldGroup}>
        <label htmlFor="patternStitchCount" className={styles.label}>
          Pattern Stitch Count
          <span className={styles.labelHint}>
            Total stitches for a section (e.g. cast-on){" "}
            <span className={styles.optionalInline}>optional</span>
          </span>
        </label>
        <input
          id="patternStitchCount"
          type="number"
          className={styles.input}
          value={patternStitchCount}
          onChange={(e) => setPatternStitchCount(e.target.value)}
          min="1"
          max="10000"
          step="1"
          placeholder="e.g. 120"
          disabled={loading}
        />
      </div>

      <div className={styles.divider} />

      <p className={styles.optionalHeading}>
        Needle recommendation{" "}
        <span className={styles.optionalBadge}>optional</span>
      </p>
      <p className={styles.optionalHint}>
        Tell us about your yarn and how you knit to get an AI-powered needle
        size suggestion.
      </p>

      <div className={styles.fieldGroup}>
        <label htmlFor="fiberType" className={styles.label}>
          Fiber Type
        </label>
        <div className={styles.selectWrapper}>
          <select
            id="fiberType"
            className={styles.select}
            value={fiberType}
            onChange={(e) => setFiberType(e.target.value)}
            disabled={loading}
          >
            <option value="">— skip —</option>
            {FIBER_TYPES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
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
