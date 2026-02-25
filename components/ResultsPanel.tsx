import styles from "./ResultsPanel.module.css";
import type { EstimateResult } from "@/app/page";
import { YARN_WEIGHT_LABELS } from "@/lib/yarnWeights";
import { suggestNeedle } from "@/lib/needleSizes";

// 4 inches = 10.16 cm; convert sts/4in → sts/10cm
function toMetric(v: number): number {
  return Math.round(v * (10 / 10.16) * 2) / 2;
}

interface ResultsPanelProps {
  result: EstimateResult | null;
  loading: boolean;
  error: string | null;
  unit: "imperial" | "metric";
}

export default function ResultsPanel({
  result,
  loading,
  error,
  unit,
}: ResultsPanelProps) {
  if (loading) {
    return (
      <div className={styles.skeleton} role="status">
        <span className={styles.srOnly}>Loading results…</span>
        <div className={styles.skeletonBlock} aria-hidden="true" />
        <div className={styles.skeletonBlock} aria-hidden="true" />
        <div className={styles.skeletonBlock} aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p className={styles.errorTitle}>Estimation failed</p>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true">
          ◎
        </div>
        <p className={styles.emptyText}>
          Fill in the form and click &ldquo;Estimate Gauge&rdquo; to get your
          gauge recommendation.
        </p>
      </div>
    );
  }

  const isMetric = unit === "metric";
  const gaugeUnit = isMetric ? "sts / 10 cm" : "sts / 4\u2033";
  const rowGaugeUnit = isMetric ? "rows / 10 cm" : "rows / 4\u2033";

  const needle = suggestNeedle(result.estimatedGauge);
  const displayGauge = isMetric
    ? toMetric(result.estimatedGauge)
    : result.estimatedGauge;
  const displayPatternGauge = isMetric
    ? toMetric(result.patternGauge)
    : result.patternGauge;
  const displayRowGauge =
    result.estimatedRowGauge !== undefined
      ? isMetric
        ? toMetric(result.estimatedRowGauge)
        : result.estimatedRowGauge
      : undefined;

  return (
    <div className={styles.results}>
      <div className={styles.gaugeCard}>
        <span className={styles.gaugeCardLabel}>Estimated Stitch Gauge</span>
        <div className={styles.gaugeCardValue}>{displayGauge}</div>
        <span className={styles.gaugeCardUnit}>{gaugeUnit}</span>

        {displayRowGauge !== undefined && (
          <div className={styles.rowGaugeInCard}>
            <span className={styles.rowGaugeInCardLabel}>Row gauge</span>
            <span className={styles.rowGaugeInCardValue}>
              {displayRowGauge}{" "}
              <span className={styles.rowGaugeInCardUnit}>{rowGaugeUnit}</span>
            </span>
          </div>
        )}
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Pattern Weight</span>
          <span className={styles.summaryItemValue}>
            {YARN_WEIGHT_LABELS[result.patternYarnWeight] ??
              result.patternYarnWeight}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Your Weight</span>
          <span className={styles.summaryItemValue}>
            {YARN_WEIGHT_LABELS[result.userYarnWeight] ?? result.userYarnWeight}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Pattern Gauge</span>
          <span className={styles.summaryItemValue}>
            {displayPatternGauge} {isMetric ? "st / 10cm" : "st / 4\u2033"}
          </span>
        </div>
      </div>

      <div className={styles.needleSection}>
        <span className={styles.needleLabel}>Suggested starting needle</span>
        <p className={styles.needleText}>
          <strong>
            US {needle.us} / {needle.metric}
          </strong>{" "}
          — cast on a swatch first to dial in your gauge before starting the
          project. You'll probably need to adjust your needle size — go up if
          you're getting too many stitches, down if too few.
        </p>
      </div>
    </div>
  );
}
