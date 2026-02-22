import styles from "./ResultsPanel.module.css";
import type { EstimateResult } from "@/app/page";

const WEIGHT_LABELS: Record<string, string> = {
  lace: "Lace (0)",
  "super-fine": "Super Fine / Fingering (1)",
  fine: "Fine / Sport (2)",
  light: "Light / DK (3)",
  medium: "Medium / Worsted (4)",
  bulky: "Bulky (5)",
  "super-bulky": "Super Bulky (6)",
  jumbo: "Jumbo (7)",
};

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
        <div className={styles.emptyIcon}>◎</div>
        <p className={styles.emptyText}>
          Fill in the form and click &ldquo;Estimate Gauge&rdquo; to get your
          AI-powered gauge recommendation.
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
            {WEIGHT_LABELS[result.patternYarnWeight] ?? result.patternYarnWeight}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryItemLabel}>Your Weight</span>
          <span className={styles.summaryItemValue}>
            {WEIGHT_LABELS[result.userYarnWeight] ?? result.userYarnWeight}
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
        <span className={styles.reasoningLabel}>Technical Analysis</span>
        <p className={styles.reasoningText}>{result.reasoning}</p>
      </div>
    </div>
  );
}
