"use client";

import { useState, FormEvent } from "react";
import styles from "./RavelryImport.module.css";

interface ImportResult {
  patternGauge: number | null;
  patternRowGauge: number | null;
  patternYarnWeight: string | null;
  patternName: string;
}

interface RavelryImportProps {
  onImport: (data: {
    patternGauge: number;
    patternRowGauge?: number;
    patternYarnWeight?: string;
    patternName: string;
  }) => void;
  disabled: boolean;
}

export default function RavelryImport({
  onImport,
  disabled,
}: RavelryImportProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<ImportResult | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setImported(null);

    try {
      const res = await fetch("/api/ravelry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Error ${res.status}`);
        return;
      }

      if (data.patternGauge === null) {
        setError("This pattern doesn't have gauge information on Ravelry.");
        return;
      }

      setImported(data);
      onImport({
        patternGauge: data.patternGauge,
        patternRowGauge: data.patternRowGauge ?? undefined,
        patternYarnWeight: data.patternYarnWeight ?? undefined,
        patternName: data.patternName,
      });
    } catch {
      setError("Could not connect to Ravelry. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImported(null);
    setUrl("");
    setError(null);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.toolLabel}>Import from Ravelry</h2>
      {imported ? (
        <div className={styles.success}>
          <div className={styles.successContent}>
            <span className={styles.checkmark} aria-hidden="true">
              ✓
            </span>
            <div className={styles.successText}>
              <span className={styles.successName}>{imported.patternName}</span>
              <span className={styles.successHint}>
                Gauge imported — fields updated below
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear imported pattern"
          >
            Clear
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <label htmlFor="ravelryUrl" className={styles.srOnly}>
              Ravelry pattern URL
            </label>
            <input
              id="ravelryUrl"
              type="text"
              className={styles.urlInput}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ravelry.com/patterns/library/pattern-name"
              disabled={disabled || loading}
              aria-describedby="ravelry-hint ravelry-error"
              spellCheck={false}
            />
            <button
              type="submit"
              className={styles.importButton}
              disabled={disabled || loading || !url.trim()}
              aria-label={loading ? "Importing pattern, please wait" : undefined}
            >
              {loading ? (
                <span className={styles.loadingDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                "Import"
              )}
            </button>
          </div>
          <p id="ravelry-hint" className={styles.hint}>
            Paste any Ravelry pattern URL to auto-fill gauge and yarn weight.
          </p>
          <p
            id="ravelry-error"
            className={styles.error}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        </form>
      )}
    </div>
  );
}
