import styles from "./ResultsPanel.module.css";
import type { EstimateResult } from "@/app/page";
import { YARN_WEIGHT_LABELS } from "@/lib/yarnWeights";

interface ResultsPanelProps {
  result: EstimateResult | null;
  loading: boolean;
  error: string | null;
}

export default function ResultsPanel({ result, loading, error }: ResultsPanelProps) {
  if (loading) {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonBlock} />
        <div className={styles.skeletonBlock} />
        <div className={styles.skeletonBlock} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p className={styles.errorTitle}>Estimation failed</p>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true">◎</div>
        <p className={styles.emptyText}>
          Fill in the form and click &ldquo;Estimate Gauge&rdquo; to get your
          gauge recommendation.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.results}>
      <div className={styles.gaugeCard}>
        <span className={styles.gaugeCardLabel}>Estimated Gauge</span>
        <div className={styles.gaugeCardValue}>{result.estimatedGauge}</div>
        <span className={styles.gaugeCardUnit}>stitches per 4 inches</span>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Pattern Weight</span>
          <span className={styles.summaryItemValue}>
            {YARN_WEIGHT_LABELS[result.patternYarnWeight] ?? result.patternYarnWeight}
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
            {result.patternGauge} st / 4&Prime;
          </span>
        </div>
      </div>

      <div className={styles.reasoningSection}>
        <span className={styles.reasoningLabel}>How we got there</span>
        <p className={styles.reasoningText}>{result.reasoning}</p>
      </div>

      {result.needleSuggestion && (
        <div className={styles.needleSection}>
          <span className={styles.needleLabel}>Needle recommendation</span>
          <p className={styles.needleText}>{result.needleSuggestion}</p>
        </div>
      )}
    </div>
  );
}
