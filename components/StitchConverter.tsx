"use client";

import { useState } from "react";
import styles from "./StitchConverter.module.css";
import type { EstimateResult } from "@/app/page";

interface StitchConverterProps {
  result: EstimateResult | null;
}

export default function StitchConverter({ result }: StitchConverterProps) {
  const [patternStitchCount, setPatternStitchCount] = useState<string>("");
  const [patternRowCount, setPatternRowCount] = useState<string>("");

  const hasResult = result !== null;

  const gaugeRatio = hasResult
    ? result.estimatedGauge / result.patternGauge
    : null;
  const rowRatio =
    result?.estimatedRowGauge !== undefined &&
    result?.patternRowGauge !== undefined
      ? result.estimatedRowGauge / result.patternRowGauge
      : null;

  const stitchVal = parseFloat(patternStitchCount);
  const newStitchCount =
    gaugeRatio !== null &&
    patternStitchCount !== "" &&
    !isNaN(stitchVal) &&
    stitchVal > 0
      ? Math.round(stitchVal * gaugeRatio)
      : null;

  const rowVal = parseFloat(patternRowCount);
  const newRowCount =
    rowRatio !== null && patternRowCount !== "" && !isNaN(rowVal) && rowVal > 0
      ? Math.round(rowVal * rowRatio)
      : null;

  return (
    <div className={styles.converter}>
      {!hasResult && (
        <p className={styles.emptyHint}>
          Estimate your gauge above first — then enter your pattern&rsquo;s
          stitch counts here to convert them.
        </p>
      )}

      <div className={styles.inputRow}>
        <div className={styles.fieldGroup}>
          <label htmlFor="patternStitchCount" className={styles.label}>
            Pattern stitches
          </label>
          <input
            id="patternStitchCount"
            type="number"
            className={styles.input}
            value={patternStitchCount}
            onChange={(e) => setPatternStitchCount(e.target.value)}
            min="1"
            step="1"
            placeholder="e.g. 50"
            disabled={!hasResult}
          />
        </div>

        {rowRatio !== null && (
          <div className={styles.fieldGroup}>
            <label htmlFor="patternRowCount" className={styles.label}>
              Pattern rows
              <span className={styles.optional}>optional</span>
            </label>
            <input
              id="patternRowCount"
              type="number"
              className={styles.input}
              value={patternRowCount}
              onChange={(e) => setPatternRowCount(e.target.value)}
              min="1"
              step="1"
              placeholder="e.g. 60"
            />
          </div>
        )}
      </div>

      {newStitchCount !== null && (
        <div className={styles.result}>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>Update to</span>
            <span className={styles.resultValue}>{newStitchCount}</span>
            <span className={styles.resultUnit}>stitches</span>
          </div>
          {newRowCount !== null && (
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Knit</span>
              <span className={styles.resultValue}>{newRowCount}</span>
              <span className={styles.resultUnit}>rows</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
