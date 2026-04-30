"use client";

import { useState, useCallback, Fragment } from "react";
import Image from "next/image";
import type { YarnWeightKey } from "@/lib/yarnWeights";
import styles from "./page.module.css";
import ResultsPanel from "@/components/ResultsPanel";
import StitchConverter from "@/components/StitchConverter";
import RavelryImport from "@/components/RavelryImport";

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

const metricToImperial = (v: number) => v * (10.16 / 10);
const imperialToMetric = (v: number) => v * (10 / 10.16);

const STEPS = ["Your Pattern", "Your Yarn", "Results"] as const;

export default function Home() {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");

  // Step 1: pattern data
  const [patternYarnWeight, setPatternYarnWeight] = useState("medium");
  const [patternGauge, setPatternGauge] = useState("18");
  const [patternRowGauge, setPatternRowGauge] = useState("");
  const [ravelryPrefillActive, setRavelryPrefillActive] = useState(false);

  // Step 2: user yarn
  const [userYarnWeight, setUserYarnWeight] = useState("light");

  // Step 3: results
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gaugeUnit = unit === "metric" ? "sts per 10 cm" : 'sts per 4"';
  const rowGaugeUnit = unit === "metric" ? "rows per 10 cm" : 'rows per 4"';

  const handleImport = useCallback(
    (data: {
      patternGauge: number;
      patternRowGauge?: number;
      patternYarnWeight?: string;
      patternName: string;
    }) => {
      if (data.patternYarnWeight) setPatternYarnWeight(data.patternYarnWeight);
      const gaugeDisplay =
        unit === "metric"
          ? String(Math.round(imperialToMetric(data.patternGauge) * 2) / 2)
          : String(data.patternGauge);
      setPatternGauge(gaugeDisplay);
      if (data.patternRowGauge !== undefined) {
        const rowDisplay =
          unit === "metric"
            ? String(
                Math.round(imperialToMetric(data.patternRowGauge) * 2) / 2
              )
            : String(data.patternRowGauge);
        setPatternRowGauge(rowDisplay);
      }
      setRavelryPrefillActive(true);
      setWizardStep(2);
    },
    [unit]
  );

  const handleClearRavelry = useCallback(() => {
    setRavelryPrefillActive(false);
    setPatternYarnWeight("medium");
    setPatternGauge("18");
    setPatternRowGauge("");
    setResult(null);
  }, []);

  const handlePatternNext = () => {
    const g = parseFloat(patternGauge);
    if (isNaN(g) || g <= 0) return;
    setWizardStep(2);
  };

  const handleCalculate = useCallback(async () => {
    const gaugeNum = parseFloat(patternGauge);
    if (isNaN(gaugeNum) || gaugeNum <= 0) return;

    const gaugeImperial =
      unit === "metric" ? metricToImperial(gaugeNum) : gaugeNum;

    let rowGaugeImperial: number | undefined;
    if (patternRowGauge !== "") {
      const r = parseFloat(patternRowGauge);
      if (!isNaN(r) && r > 0) {
        rowGaugeImperial =
          unit === "metric" ? metricToImperial(r) : r;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setWizardStep(3);

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patternYarnWeight,
          patternGauge: gaugeImperial,
          patternRowGauge: rowGaugeImperial,
          userYarnWeight,
        }),
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
        patternYarnWeight: patternYarnWeight as YarnWeightKey,
        patternGauge: gaugeImperial,
        patternRowGauge: rowGaugeImperial,
        userYarnWeight: userYarnWeight as YarnWeightKey,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [patternYarnWeight, patternGauge, patternRowGauge, userYarnWeight, unit]);

  const handleStartOver = () => {
    setWizardStep(1);
    setResult(null);
    setError(null);
    setPatternYarnWeight("medium");
    setPatternGauge("18");
    setPatternRowGauge("");
    setUserYarnWeight("light");
    setRavelryPrefillActive(false);
  };

  const patternGaugeValid = parseFloat(patternGauge) > 0;
  const selectedPattern = YARN_WEIGHTS.find((w) => w.value === patternYarnWeight);
  const selectedUser = YARN_WEIGHTS.find((w) => w.value === userYarnWeight);

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <Image src="/icon.svg" alt="" width={30} height={30} aria-hidden />
            <span>Gauge Calculator</span>
          </div>
          <button
            className={styles.unitToggle}
            onClick={() =>
              setUnit((u) => (u === "imperial" ? "metric" : "imperial"))
            }
            aria-label={
              unit === "metric"
                ? "Switch to imperial (inches)"
                : "Switch to metric (cm)"
            }
            aria-pressed={unit === "metric"}
          >
            <span className={unit === "imperial" ? styles.unitOn : styles.unitOff}>in</span>
            <span className={styles.unitSlash}>/</span>
            <span className={unit === "metric" ? styles.unitOn : styles.unitOff}>cm</span>
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Introduction">
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Switching yarns?<br />We do the math.
          </h1>
          <p className={styles.heroSubtitle}>
            Tell us what your pattern calls for and what yarn you have — we&rsquo;ll
            estimate your gauge and suggest a starting needle size.
          </p>
        </div>
        <div className={styles.heroIllustration} aria-hidden="true">
          <HeroIllustration />
        </div>
      </section>

      {/* ── Step progress ── */}
      <nav className={styles.stepProgress} aria-label="Progress">
        {STEPS.map((label, i) => {
          const step = (i + 1) as 1 | 2 | 3;
          const isDone = wizardStep > step;
          const isCurrent = wizardStep === step;
          return (
            <Fragment key={step}>
              {i > 0 && (
                <div
                  className={`${styles.progressLine} ${wizardStep > i ? styles.progressLineDone : ""}`}
                  aria-hidden="true"
                />
              )}
              <div className={styles.stepProgressGroup}>
                <div
                  className={`${styles.progressDot} ${isCurrent ? styles.progressDotCurrent : ""} ${isDone ? styles.progressDotDone : ""}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isDone ? "✓" : step}
                </div>
                <span className={styles.progressLabel}>{label}</span>
              </div>
            </Fragment>
          );
        })}
      </nav>

      {/* ── Wizard ── */}
      <main className={styles.main} id="wizard">

        {/* Step 1: Pattern */}
        {wizardStep === 1 && (
          <div className={styles.stepCard} aria-label="Step 1: Your pattern">
            <div className={styles.stepCardHead}>
              <div className={styles.stepBadge} aria-hidden="true">1</div>
              <div>
                <h2 className={styles.stepTitle}>Your pattern</h2>
                <p className={styles.stepSubtitle}>
                  What does the pattern call for?
                </p>
              </div>
            </div>

            {/* Ravelry shortcut */}
            <div className={styles.ravelryBox}>
              <div className={styles.ravelryBoxHead}>
                <span className={styles.pill}>Shortcut</span>
                <span className={styles.ravelryBoxTitle}>Import from Ravelry</span>
              </div>
              <RavelryImport
                onImport={handleImport}
                onClear={handleClearRavelry}
                disabled={loading}
              />
            </div>

            <div className={styles.orDivider}>
              <span>or fill in manually</span>
            </div>

            {/* Manual fields */}
            <div className={`${styles.manualFields} ${ravelryPrefillActive ? styles.fieldsLocked : ""}`}>
              <div className={styles.field}>
                <label htmlFor="patternWeight" className={styles.label}>
                  Pattern calls for
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id="patternWeight"
                    className={styles.select}
                    value={patternYarnWeight}
                    onChange={(e) => setPatternYarnWeight(e.target.value)}
                    disabled={ravelryPrefillActive}
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
                <div className={styles.field}>
                  <label htmlFor="patternGauge" className={styles.label}>
                    Stitch gauge{" "}
                    <span className={styles.unitHint}>{gaugeUnit}</span>
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
                    placeholder="e.g. 18"
                    disabled={ravelryPrefillActive}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="patternRowGauge" className={styles.label}>
                    Row gauge{" "}
                    <span className={styles.unitHint}>
                      {rowGaugeUnit}{" "}
                      <span className={styles.optionalBadge}>optional</span>
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
                    placeholder="e.g. 24"
                    disabled={ravelryPrefillActive}
                  />
                </div>
              </div>
            </div>

            <div className={styles.stepActions}>
              <button
                className={styles.primaryBtn}
                onClick={handlePatternNext}
                disabled={!patternGaugeValid}
              >
                Next: Pick Your Yarn →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: User yarn */}
        {wizardStep === 2 && (
          <div className={styles.stepCard} aria-label="Step 2: Your yarn">
            <div className={styles.stepCardHead}>
              <div className={styles.stepBadge} aria-hidden="true">2</div>
              <div>
                <h2 className={styles.stepTitle}>Your yarn</h2>
                <p className={styles.stepSubtitle}>
                  What weight are you substituting?
                </p>
              </div>
            </div>

            {/* Recap of step 1 */}
            <div className={styles.recap} aria-label="Pattern summary">
              <div className={styles.recapItem}>
                <span className={styles.recapLabel}>Pattern weight</span>
                <span className={styles.recapValue}>
                  {selectedPattern?.label ?? patternYarnWeight}
                </span>
              </div>
              <div className={styles.recapItem}>
                <span className={styles.recapLabel}>Stitch gauge</span>
                <span className={styles.recapValue}>
                  {patternGauge}{" "}
                  <span className={styles.recapUnit}>
                    {unit === "metric" ? "sts/10cm" : 'sts/4"'}
                  </span>
                </span>
              </div>
              {patternRowGauge && (
                <div className={styles.recapItem}>
                  <span className={styles.recapLabel}>Row gauge</span>
                  <span className={styles.recapValue}>
                    {patternRowGauge}{" "}
                    <span className={styles.recapUnit}>
                      {unit === "metric" ? "rows/10cm" : 'rows/4"'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="userWeight" className={styles.label}>
                I&rsquo;m substituting with
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="userWeight"
                  className={styles.select}
                  value={userYarnWeight}
                  onChange={(e) => setUserYarnWeight(e.target.value)}
                >
                  {YARN_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.stepActions}>
              <button
                className={styles.ghostBtn}
                onClick={() => setWizardStep(1)}
              >
                ← Back
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleCalculate}
                disabled={loading}
              >
                Calculate My Gauge →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {wizardStep === 3 && (
          <div
            className={styles.resultsStep}
            aria-label="Step 3: Results"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className={styles.resultsStepHead}>
              <div
                className={`${styles.stepBadge} ${result ? styles.stepBadgeDone : ""}`}
                aria-hidden="true"
              >
                {result && !loading ? "✓" : "3"}
              </div>
              <div>
                <h2 className={styles.stepTitle}>
                  {loading
                    ? "Calculating…"
                    : error
                    ? "Something went wrong"
                    : "Your gauge estimate"}
                </h2>
                {result && !loading && (
                  <p className={styles.stepSubtitle}>
                    {selectedUser?.label ?? userYarnWeight} — ready to knit
                  </p>
                )}
              </div>
            </div>

            <ResultsPanel
              result={result}
              loading={loading}
              error={error}
              unit={unit}
            />

            {result && (
              <div className={styles.converterSection}>
                <div className={styles.converterHeader}>
                  <h3 className={styles.converterTitle}>
                    Stitch Count Converter
                  </h3>
                  <p className={styles.converterSubtitle}>
                    Enter your pattern&rsquo;s stitch counts to scale them to
                    your yarn
                  </p>
                </div>
                <StitchConverter result={result} />
              </div>
            )}

            <button className={styles.startOverBtn} onClick={handleStartOver}>
              ← Start a new calculation
            </button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Made for knitters who switch yarns &nbsp;🧶</p>
        <p>
          Made by{" "}
          <a
            href="https://www.aylinmarie.co"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Aylin Marie
          </a>
        </p>
      </footer>
    </div>
  );
}

/* ── Inline SVG components ── */


function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 260 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background blob */}
      <ellipse cx="130" cy="125" rx="115" ry="100" fill="#FFF5E6" />

      {/* Needle 1 — left to right, behind ball */}
      <line x1="38" y1="28" x2="178" y2="205" stroke="#FF6B47" strokeWidth="9" strokeLinecap="round" />
      <circle cx="178" cy="205" r="11" fill="#FF6B47" stroke="#1A1207" strokeWidth="2.5" />
      <polygon points="32,20 46,16 38,34" fill="#1A1207" />

      {/* Needle 2 — right to left, behind ball */}
      <line x1="222" y1="28" x2="82" y2="205" stroke="#FF6B47" strokeWidth="9" strokeLinecap="round" />
      <circle cx="82" cy="205" r="11" fill="#FF6B47" stroke="#1A1207" strokeWidth="2.5" />
      <polygon points="228,20 214,16 222,34" fill="#1A1207" />

      {/* Yarn ball — on top of needles */}
      <circle cx="130" cy="112" r="76" fill="#FFE01B" stroke="#1A1207" strokeWidth="3" />
      <ellipse cx="130" cy="112" rx="46" ry="76" stroke="#1A1207" strokeWidth="1.8" fill="none" />
      <ellipse cx="130" cy="112" rx="76" ry="36" stroke="#1A1207" strokeWidth="1.8" fill="none" />
      <path d="M68,76 Q130,58 192,80" stroke="#1A1207" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M56,116 Q130,98 204,122" stroke="#1A1207" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M68,156 Q130,170 192,150" stroke="#1A1207" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Decorative dots */}
      <circle cx="28" cy="80" r="5" fill="#FFE01B" stroke="#1A1207" strokeWidth="1.5" />
      <circle cx="232" cy="80" r="5" fill="#FFE01B" stroke="#1A1207" strokeWidth="1.5" />
      <circle cx="48" cy="170" r="4" fill="#FF6B47" stroke="#1A1207" strokeWidth="1.5" />
      <circle cx="212" cy="170" r="4" fill="#FF6B47" stroke="#1A1207" strokeWidth="1.5" />
    </svg>
  );
}
