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

const TENSION_OPTIONS = [
  {
    value: "loose",
    label: "Loose — my stitches tend to be bigger than average",
  },
  { value: "average", label: "Average — I usually match the pattern gauge" },
  {
    value: "tight",
    label: "Tight — my stitches tend to be smaller than average",
  },
];

interface GaugeFormProps {
  onSubmit: (data: {
    patternYarnWeight: string;
    patternGauge: number;
    userYarnWeight: string;
    fiberType?: string;
    tension?: string;
  }) => void;
  loading: boolean;
}

export default function GaugeForm({ onSubmit, loading }: GaugeFormProps) {
  const [patternYarnWeight, setPatternYarnWeight] = useState("medium");
  const [patternGauge, setPatternGauge] = useState<string>("18");
  const [userYarnWeight, setUserYarnWeight] = useState("light");
  const [fiberType, setFiberType] = useState("");
  const [tension, setTension] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const gaugeNum = parseFloat(patternGauge);
    if (isNaN(gaugeNum) || gaugeNum <= 0) return;
    onSubmit({
      patternYarnWeight,
      patternGauge: gaugeNum,
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

      <div className={styles.fieldGroup}>
        <label htmlFor="patternGauge" className={styles.label}>
          Pattern Gauge
          <span className={styles.labelHint}>
            Stitches per 4 inches (as written in the pattern)
          </span>
        </label>
        <input
          id="patternGauge"
          type="number"
          className={styles.input}
          value={patternGauge}
          onChange={(e) => setPatternGauge(e.target.value)}
          min="1"
          max="100"
          step="0.5"
          placeholder="e.g. 18"
          disabled={loading}
          required
        />
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

      {/* <div className={styles.fieldGroup}>
        <label htmlFor="tension" className={styles.label}>
          Your Tension
        </label>
        <div className={styles.selectWrapper}>
          <select
            id="tension"
            className={styles.select}
            value={tension}
            onChange={(e) => setTension(e.target.value)}
            disabled={loading}
          >
            <option value="">— skip —</option>
            {TENSION_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div> */}

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
